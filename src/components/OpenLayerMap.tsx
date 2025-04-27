import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';

import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import Overlay from 'ol/Overlay'
//import Popup from 'ol/Popup'
//import {tile as tileStrategy} from 'ol/loadingstrategy';
//import {createXYZ} from 'ol/tilegrid';
import {Search} from 'ol-ext/control/SearchFeature';
import { OSM } from 'ol/source';
import {Select} from 'ol/interaction/Select';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import GeoJSON from "ol/format/GeoJSON"
//import EsriJSON from "ol/format/EsriJSON"
import {Style, Icon, Fill, Circle, Stroke} from "ol/style"

const OpenLayersMap = () => {
  const [term, setTerm] = useState('');

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    // Do something 
    alert(term);
  }
	const [data,setData] = useState({});
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
const vectorsource_offset: any = new VectorSource();
const format: any = new GeoJSON();
 //vectorsource_offset.addFeature(format.readFeatures(data))

const vectorLayer2: any = new VectorLayer({
    source: vectorsource_offset,

});
const vectorLayer1: any = new VectorLayer({
    source: new VectorSource({
        format: new GeoJSON(),
        url: url_1,
attributions: ['Los Angeles GeoHub |']
    }),

});
const urls: string[] = [];
for(var i = 0; i < 1088001; i = i + 2000){
  const url_2: any = `https://geo.sandag.org/server/rest/services/Hosted/Parcels/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&resultOffset=${i}&resultType=none&f=geojson`;
	  urls.push(url_2);
}


  // default view

    useEffect(() => {


	    urls.forEach((url,index) => {

  fetch(url)
  .then(response => response.json())
  .then(response => vectorsource_offset.addFeatures(format.readFeatures(response, {
          dataProjection: 'EPSG:4326',
          featureProjection: map.getView().getProjection(),
        })))
  .catch(error => console.error(error));

	    })
	    

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
		vectorLayer2,
            ],
view: new View({
    center: [-13042228, 3857849],
    zoom: 12,
  }),
  overlays: [overlay],
	});
	 // Control Select 
  var select = new Select({});
  map.addInteraction(select);

	var search = new Search ({
		source:vectorsource_offset,


	})

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
      console.log("feature " + JSON.stringify(feature,null,'\t'));

  if(feature && feature.get("subname")){
      if (popupRef.current) {
        popupRef.current.innerHTML = `<p>Parcel</p><code>` +
		`<p>Parcel ID ${feature.get('parcelid')}</p>` + 
		`<p>APN ${feature.get('apn')}</p>` + 
		`<p>Legldesc ${feature.get('legldesc')}</p>` + 
		`<p>x \& y coord${feature.get('x_coord')} / ${feature.get('y_coord')}</p>` + 
		`<p>${feature.get('situs_address')} ${feature.get('situs_street')}  ${feature.get('situs_suffix')} ${feature.get('situs_community')} ${feature.get('situs_zip')}</p>` + 
		`<p> Unit Qty ${feature.get('unitqty')}</p>` + 
		`<p> Usable sq ft. ${feature.get('usable_sq_feet')}</p>` + 
		`<p> total lvg area ${feature.get('total_lvg_area')}</p>` + 
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
    }, [data]);

    return (
        <>
            <div ref={mapDivRef} className='map'>
    <div className="container">
      <form onSubmit={submitForm}>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          type="text"
          placeholder="Enter a term"
          className="input"
        />
        <button type="submit" className="btn">Submit</button>
      </form>
    </div>
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
