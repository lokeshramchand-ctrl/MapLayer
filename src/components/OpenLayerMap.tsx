import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';

import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import Overlay from 'ol/Overlay'
//import Popup from 'ol/Popup'
//import {tile as tileStrategy} from 'ol/loadingstrategy';
//import {createXYZ} from 'ol/tilegrid';
import { OSM } from 'ol/source';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import GeoJSON from "ol/format/GeoJSON"
//import EsriJSON from "ol/format/EsriJSON"
import {Style, Icon, Fill, Circle, Stroke} from "ol/style"

const OpenLayersMap = () => {
    const mapDivRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const [clickedCoordinate, setClickedCoordinate] = useState<Coordinate>();

  const url_1: any = "https://geo.sandag.org/server/rest/services/Hosted/Address_Points/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&resultType=standard&f=geojson";
  const url_2: any = "https://geo.sandag.org/server/rest/services/Hosted/Parcels/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&resultType=none&f=geojson";

const vectorLayer: any = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: url_2,
style: new Style({
    fill: new Fill({
      color: 'red',
    }),
    stroke: new Stroke({
      color: 'black',
      width: 2.25
    }),
  }),
    }),

});
const vectorLayer1: any = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: url_1,
attributions: ['Los Angeles GeoHub |']
    }),

});


  // default view

    useEffect(() => {

const overlay = new Overlay({
      element: popupRef.current as HTMLDivElement,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    })
        const map = new Map({
            target: mapDivRef.current as HTMLDivElement,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
		vectorLayer,
		vectorLayer1
            ],
view: new View({
    center: [-13042228, 3857849],
    zoom: 12,
  }),
  overlays: [overlay],
	});

        map.on('click', (e) => {
            setClickedCoordinate(e.coordinate);
// Get Coordinates of click
      const coordinate = e.coordinate;
      //const hdms = toStringHDMS(toLonLat(coordinate));

const feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
    return feature;
  });
      
      // Show popup at clicked position
      overlay.setPosition(coordinate);
      if(feature)
      console.log("feature " + JSON.stringify(feature));

  if(feature && feature.get("subname")){
      if (popupRef.current) {
        popupRef.current.innerHTML = `<p>You clicked here:</p><code>` +
		`<p>Parcel</p>` + 

		`<p>${feature.get('subname')}</p>` + 
		`<p> Unit Qty ${feature.get('unitqty')}</p>` + 
		`<p>${feature.get('situs_community')} ${feature.get('situs_zip')}</p>` + 
		`<p>bedrooms ${feature.get('bedrooms')} Baths ${feature.get('baths')}</p>` + 
		 `</code>`;
      }
  }
  else if(feature && feature.get('addrsfx')){
      if (popupRef.current) {
        popupRef.current.innerHTML = `<p>You clicked here:</p><code>` +
		`<p>Address Point</p>` + 

		`<p>${feature.get('addrname')} ${feature.get('addrsfx')}</p>` + 
		`<p>${feature.get('addrzip')}</p>` + 
		`<p>${feature.get('community')}</p>` + 
		 `</code>`;
      }
  }
  else{
      if (popupRef.current) {
        popupRef.current.innerHTML = `<p>You clicked here:</p><code>` +
		`<p>Not a parcel or Address Point</p>` + 
		 `</code>`;
      }


  }
      
      overlay.setPosition(coordinate)
        });


 // fit view to geometry of geojson feature with padding
    //def_view.fit(geoJSONFeatures[0].getGeometry().getExtent(), { padding: [100, 100, 100, 100]});

        return () => map.setTarget(undefined);
    }, []);

    return (
        <>
            <div ref={mapDivRef} className='map'>
<div ref={popupRef} className="ol-popup"/>
	    </div>
            {clickedCoordinate && (
                <span className='coordinates-container'>
                    You clicked at: {clickedCoordinate[0]} /{' '} {clickedCoordinate[1]}
                </span>
            )}
        </>
    );
};

export default OpenLayersMap;
