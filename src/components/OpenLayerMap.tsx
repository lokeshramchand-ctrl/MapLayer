import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';

import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import {tile as tileStrategy} from 'ol/loadingstrategy';
import {createXYZ} from 'ol/tilegrid';
import { OSM } from 'ol/source';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import GeoJSON from "ol/format/GeoJSON"
import EsriJSON from "ol/format/EsriJSON"
import {Style, Icon, Fill, Circle} from "ol/style"
import {getCenter} from 'ol/extent';
import ImageLayer from 'ol/layer/Image';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';

const OpenLayersMap = () => {
    const mapDivRef = useRef<HTMLDivElement>(null);

    const [olMap, setOlMap] = useState<Map>();

    const [clickedCoordinate, setClickedCoordinate] = useState<Coordinate>();

  const mapRef = useRef()

 // // read geojson feature
 // const geoJSONFeatures: any = new GeoJSON().readFeatures(../assets/Address_Points.geojson)

 // // create vector source
 // const vectorSource: any = new VectorSource({
 //   features: geoJSONFeatures,
 // })

 // // create vector layer with source
 // const vectorLayer :any = new VectorLayer({
 //   source: vectorSource,
 // })
const url: any =
  'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/' +
  'USA/MapServer';
  const url_1: any = "https://geo.sandag.org/server/rest/services/Hosted/Address_Points/FeatureServer/";
  const layer: any = '0';

const vectorLayer: any = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: './assets/Address_Points.geojson'
    }),

});

const vectorSource: any = new VectorSource({
  format: new EsriJSON(),
  url: function (extent, resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid: any = projection.getCode().split(/:(?=\d+$)/).pop();

    const url =
      url_1 +
      layer +
      '/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent(
        '{"xmin":' +
          extent[0] +
          ',"ymin":' +
          extent[1] +
          ',"xmax":' +
          extent[2] +
          ',"ymax":' +
          extent[3] +
          ',"spatialReference":{"wkid":' +
          srid +
          '}}',
      ) +
      '&geometryType=esriGeometryEnvelope&inSR=' +
      srid +
      '&outFields=*' +
      '&outSR=' +
      srid;

    return url;
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 512,
    }),
  ),
  attributions:
    'University of Leicester (commissioned by the ' +
    '<a href="https://www.arcgis.com/home/item.html?id=' +
    'd5f05b1dc3dd4d76906c421bc1727805">National Trust</a>)',
});

  // default view
  const def_view: any = new View({
    center: [0, 0],
    zoom: 2,
  })

    useEffect(() => {
        const map = new Map({
            target: mapDivRef.current as HTMLDivElement,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
 new ImageLayer({
    source: new ImageArcGISRest({
      ratio: 1,
      params: {},
      url: './assets/Address_Points.geojson',
    }),
  }),
            ],
view: new View({
    center: [-10997148, 4569099],
    zoom: 4,
  })
	});

        map.on('click', (e) => {
            setClickedCoordinate(e.coordinate);
        });

        setOlMap(map);

 // fit view to geometry of geojson feature with padding
    //def_view.fit(geoJSONFeatures[0].getGeometry().getExtent(), { padding: [100, 100, 100, 100]});

        return () => map.setTarget(undefined);
    }, []);

    return (
        <>
            <div ref={mapDivRef} className='map' />
            {clickedCoordinate && (
                <span className='coordinates-container'>
                    You clicked at: {clickedCoordinate[0]} /{' '}
                    {clickedCoordinate[1]}
                </span>

            )}
        </>
    );
};

export default OpenLayersMap;
