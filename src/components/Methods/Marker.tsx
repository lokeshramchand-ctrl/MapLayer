// src/Methods/addMarker.ts

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { Map } from 'ol';
import { Coordinate } from 'ol/coordinate';

/**
 * Adds a custom icon marker to the map at a given coordinate,
 * replacing the previous marker layer if one exists.
 */
export const addMarker = (
  coords: Coordinate,
  map: Map,
  existingMarkerLayer: VectorLayer | null
): VectorLayer => {
  // Create feature for the marker
  const markerFeature = new Feature({
    geometry: new Point(coords),
  });

  markerFeature.setStyle(
    new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
        scale: 0.05,
      }),
    })
  );

  // Create new layer with this feature
  const markerSource = new VectorSource({ features: [markerFeature] });
  const markerLayer = new VectorLayer({ source: markerSource });

  // Remove old marker layer if it exists
  if (existingMarkerLayer) {
    map.removeLayer(existingMarkerLayer);
  }

  // Add the new marker layer
  map.addLayer(markerLayer);

  return markerLayer;
};
