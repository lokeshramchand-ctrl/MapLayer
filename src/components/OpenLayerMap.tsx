import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';

const OpenLayersMap = () => {
  // const [term, setTerm] = useState({});
  const [term, setTerm] = useState<string>('');
  const [address, setAddress] = useState();


  //Submit Button Logic

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${term}&format=json&polygon=1&addressdetails=1`)

    const json = await response.json();
    console.log(json);
    setAddress(json);
    console.log(address);
    alert(term);
  }

  //Submit Button Logic


  //const [data, setData] = useState({});
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [clickedCoordinate, setClickedCoordinate] = useState<Coordinate>();
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {

    //Initial Location
    var ar = [-117.9112790, 34.0296349]
    var proj_lat_long = fromLonLat(ar);

    //Map Display
    const map = new Map({
      target: mapDivRef.current as HTMLDivElement,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      //End of Map Initialization


      view: new View({
        center: [-13042228, 3857849],
        //center: proj_lat_long,
        zoom: 12,
      }),
    });
  mapRef.current = map;


    map.on('click', (e) => {
      setClickedCoordinate(e.coordinate);
      // Get Coordinates of click
      const coordinate = e.coordinate;
      //const hdms = toStringHDMS(toLonLat(coordinate));
      const feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
        return feature;
      });

    });


    //Needed for Searching Location
    // Zoom to lat lon
    if (address) {
      console.log("ASDF" + address[1].lat)

      var ar = [address[1].lon, address[1].lat]
      var proj_lat_long = fromLonLat(ar);
      map.setView(
        new View({
          center: proj_lat_long,
          zoom: 15
        })
      )
    }

    return () => map.setTarget(undefined);
  }, [address]);



//Parcel Layer
useEffect(() => {
  if (!mapRef.current) return;

const url = 'https://geo.sandag.org/server/rest/services/Hosted/Parcels/FeatureServer/0/query' +
            '?where=1=1&outFields=*&returnGeometry=true&f=geojson&resultRecordCount=5000';

  fetch(url)
    .then((res) => res.json())
    .then((geojsonData) => {
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geojsonData, {
          featureProjection: 'EPSG:3857', // Make sure features match OSM projection
        }),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'green',
            width: 1.5,
          }),
          fill: new Fill({
            color: 'rgba(0, 255, 0, 0.1)',
          }),
        }),
      });

      mapRef.current?.addLayer(vectorLayer);

      // ✅ Fit map to features
      mapRef.current?.getView().fit(vectorSource.getExtent(), {
        padding: [20, 20, 20, 20],
        maxZoom: 17,
      });
    })
    .catch((err) => {
      console.error('Error loading GeoJSON:', err);
    });
}, []);











  //UI Downstairs
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



