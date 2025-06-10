import { Map } from 'ol';
import 'ol/ol.css';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';


export const loadAndRenderGeoJsonLayer = async (
  url: string,
  map: Map,
  layerRef: React.MutableRefObject<VectorLayer | null>,
  style: Style
) => {
  try {
    const res = await fetch(url);
    const geojsonData = await res.json();


    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        featureProjection: 'EPSG:3857',
      }),
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: style,
    });

    map.addLayer(vectorLayer);
    layerRef.current = vectorLayer;
  } catch (err) {
    console.error(`Failed to load layer from ${url}:`, err);
  }
};