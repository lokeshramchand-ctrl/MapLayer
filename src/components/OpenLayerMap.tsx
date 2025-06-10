import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import { layerConfigs } from './Methods/LayerConfig';
import Icon from 'ol/style/Icon';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { loadAndRenderGeoJsonLayer } from './Methods/Layers'

const OpenLayersMap = () => {
  const [term, setTerm] = useState<string>('');
  const [address, setAddress] = useState();

  //Submit Button Logic
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();

    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${term}&format=json&polygon=1&addressdetails=1`);
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
  const markerLayerRef = useRef<VectorLayer | null>(null);
  const layerRefs = useRef<Record<string, React.MutableRefObject<VectorLayer | null>>>(
    Object.fromEntries(
      layerConfigs.map((layer) => [layer.topic, { current: null }])
    )
  );

  useEffect(() => {
    if (!mapRef.current) {
      const map = new Map({
        target: mapDivRef.current as HTMLDivElement,
        layers: [new TileLayer({ source: new OSM() })],
      });
      mapRef.current = map;

      map.on('click', (e) => {
        setClickedCoordinate(e.coordinate);
      });
    }

    if (address && address.length > 0) {
      const lat = parseFloat(address[0].lat);
      const lon = parseFloat(address[0].lon);
      const coords = fromLonLat([lon, lat]);

      mapRef.current!.setView(new View({
        center: coords,
        zoom: 15,
      }));

      const markerFeature = new Feature({
        geometry: new Point(coords),
      });

      markerFeature.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.05,
        }),
      }));

      const markerSource = new VectorSource({ features: [markerFeature] });
      const markerLayer = new VectorLayer({ source: markerSource });

      if (markerLayerRef.current) {
        mapRef.current!.removeLayer(markerLayerRef.current);
      }
      mapRef.current!.addLayer(markerLayer);
      markerLayerRef.current = markerLayer;

      layerConfigs.forEach((layerConfig) => {
        const url = layerConfig.getUrl(lon, lat, layerConfig.radius);
        const ref = layerRefs.current[layerConfig.topic];

        loadAndRenderGeoJsonLayer(
          url,
          mapRef.current!,
          ref,
          layerConfig.style
        );
      });
    }
  }, [address]);


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
