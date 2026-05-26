type NearbyLayerFeature = {
  layer: string;
  properties: Record<string, unknown>;
};

export type AISummary = {
  summary: string;
  data_used: { layer: string; featureCount: number; source: string }[];
  hazards: { type: string; evidence: string; confidence: 'low' | 'medium' | 'high' }[];
  floodZone: { present: boolean; zoneType: string | null; source: string | null };
  parcels: { present: boolean; parcelId?: string | null; owner?: string | null; zoning?: string | null; source?: string | null } | null;
  missing_layers: string[];
  short_answer?: string;
};

export interface LayerContext {
  address: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  nearbyLayers: NearbyLayerFeature[];
  activeLayers: string[];
}

const OLLAMA_URL = 'https://ollama.splsystems.in/api/chat';
const OLLAMA_MODEL = 'llava:7b';

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

export async function getAISummary(context: LayerContext, query?: string): Promise<AISummary> {
  const nearbyLayerDigest = buildNearbyLayerDigest(context.nearbyLayers);
  const prompt = `
You are a geospatial and real-estate analyst. Use ONLY the provided GIS data. Do NOT invent facts. If data is missing, state it explicitly. Prioritize FEMA/NFHL flood zones and cadastral/parcel layers when determining risk and development implications.

Property Context:
${JSON.stringify({
    address: context.address,
    coordinates: context.coordinates,
    activeLayers: context.activeLayers,
    nearbyLayers: nearbyLayerDigest,
    userQuery: query || 'Provide full location intelligence'
  }, null, 2)}

Return JSON exactly matching this schema (no extra text). IMPORTANT: include "parcels" and "floodZone" fields with provenance:
{
  "summary": "short text",
  "data_used": [{ "layer": "string", "featureCount": number, "source": "string" }],
  "hazards": [{ "type": "string", "evidence": "string", "confidence": "low|medium|high" }],
  "floodZone": { "present": true|false, "zoneType": "string|null", "source": "string|null" },
  "parcels": { "present": true|false, "parcelId": "string|null", "owner": "string|null", "zoning": "string|null", "source": "string|null" },
  "missing_layers": ["string"],
  "short_answer": "string"
}

If a field cannot be populated because the corresponding layer is absent, set it to null and list that layer in "missing_layers".
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
          content: 'You are a geospatial and real-estate analyst. Ground every answer in the supplied map context. Do not fabricate missing facts. Output ONLY valid JSON as requested by the user.'
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
  const content = data?.message?.content ?? data?.response ?? data;

  let parsed: unknown;
  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    throw new Error('AI response was not valid JSON.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI request returned an invalid response payload.');
  }

  const summary = parsed as Partial<AISummary>;

  if (typeof summary.summary !== 'string') throw new Error('AI response is missing `summary`.');
  if (!Array.isArray(summary.data_used)) throw new Error('AI response is missing `data_used`.');
  if (!Array.isArray(summary.hazards)) throw new Error('AI response is missing `hazards`.');
  if (!summary.floodZone || typeof summary.floodZone !== 'object') throw new Error('AI response is missing `floodZone`.');
  if (!Array.isArray(summary.missing_layers)) throw new Error('AI response is missing `missing_layers`.');

  return {
    summary: summary.summary,
    data_used: summary.data_used,
    hazards: summary.hazards,
    floodZone: summary.floodZone,
    parcels: summary.parcels ?? null,
    missing_layers: summary.missing_layers,
    short_answer: summary.short_answer,
  };
}