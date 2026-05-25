export interface LayerContext {
  address: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  nearbyLayers: any[];
  activeLayers: string[];
}

const OLLAMA_URL = 'https://ollama.splsystems.in/api/chat';
const OLLAMA_MODEL = 'gemma4:latest';

type NearbyLayerFeature = {
  layer: string;
  properties: Record<string, unknown>;
};

const buildNearbyLayerDigest = (nearbyLayers: NearbyLayerFeature[]) => {
  const grouped = nearbyLayers.reduce<Map<string, Record<string, unknown>[]>>((acc, feature) => {
    const bucket = acc.get(feature.layer) ?? [];
    bucket.push(feature.properties);
    acc.set(feature.layer, bucket);
    return acc;
  }, new Map());

  return Array.from(grouped.entries()).map(([layer, properties]) => ({
    layer,
    featureCount: properties.length,
    sampleFeatures: properties.slice(0, 5)
  }));
};

export async function getAISummary(context: LayerContext, query?: string) {
  const nearbyLayerDigest = buildNearbyLayerDigest(context.nearbyLayers as NearbyLayerFeature[]);
  const prompt = `
Use only the provided GIS data. Do not invent weather advisories, zoning details, or infrastructure that are not present in the context.
If the data is incomplete, say so clearly and explain which layer types are missing.

Property Context:
${JSON.stringify({
  address: context.address,
  coordinates: context.coordinates,
  activeLayers: context.activeLayers,
  nearbyLayers: nearbyLayerDigest,
  userQuery: query || 'Provide full location intelligence'
}, null, 2)}

Return a concise property intelligence report with these sections:
1. What the loaded layers actually show
2. Nearby hazards or environmental constraints, only if evidenced by the data
3. Transportation / access / adjacency signals
4. Development or zoning implications, only if those layers exist
5. Real-estate implications
6. Missing data or uncertainty
7. Short answer to the user query

If NOAA weather warnings are not actually present in the loaded features, do not mention weather advisories.
If no parcel or zoning data is available, say that directly instead of guessing.
`;

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a geospatial and real-estate analyst. Ground every answer in the supplied map context. Do not fabricate missing facts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`AI request failed with status ${response.status}${errorText ? `: ${errorText}` : ''}`);
  }

  const data = await response.json();

  const content = data?.message?.content ?? data?.response;

  if (typeof content !== 'string') {
    throw new Error('AI request returned an unexpected response payload.');
  }

  return content;
}