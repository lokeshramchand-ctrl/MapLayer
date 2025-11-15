import { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import { layerConfigs } from './Methods/Layers';
import { loadAndRenderGeoJsonLayer } from './Methods/GeoJson_Load'
import { addMarker } from './Methods/Marker';
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8085';

const OpenLayersMap = () => {
  const [term, setTerm] = useState<string>('');
  const [address, setAddress] = useState<any[] | null>(null);
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});
  const [searchCompleted, setSearchCompleted] = useState(false);

  // Submit Button Logic
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault();
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${term}&format=json&polygon=1&addressdetails=1`);
    const json = await response.json();
    console.log(json);
    setAddress(json);
    console.log(address);
    setSearchCompleted(true);
    
    // Initialize all layers as visible
    const initialVisibility = Object.fromEntries(
      layerConfigs.map(layer => [layer.topic, true])
    );
    setLayerVisibility(initialVisibility);
    
   // alert(term);
  }

  const mapDivRef = useRef<HTMLDivElement>(null);
  const [clickedCoordinate, setClickedCoordinate] = useState<Coordinate>();
  const mapRef = useRef<Map | null>(null);
  const markerLayerRef = useRef<VectorLayer | null>(null);
  const layerRefs = useRef<Record<string, React.MutableRefObject<VectorLayer | null>>>(
    Object.fromEntries(
      layerConfigs.map((layer) => [layer.topic, { current: null }])
    )
  );

  // Toggle layer visibility
  const toggleLayer = (layerTopic: string) => {
    const layerRef = layerRefs.current[layerTopic];
    const isCurrentlyVisible = layerVisibility[layerTopic];
    
    if (layerRef.current) {
      layerRef.current.setVisible(!isCurrentlyVisible);
    }
    
    setLayerVisibility(prev => ({
      ...prev,
      [layerTopic]: !isCurrentlyVisible
    }));
  };

  // Format layer name for display
  const formatLayerName = (topic: string) => {
    return topic.replace(/_/g, ' ').replace(/SD$/, '').trim();
  };

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

      markerLayerRef.current = addMarker(coords, mapRef.current!, markerLayerRef.current);
      
     layerConfigs.forEach((layerConfig) => {
    const url = `${BACKEND_BASE}/api/layer?topic=${encodeURIComponent(layerConfig.topic)}&lon=${lon}&lat=${lat}&radius=${layerConfig.radius}`;
  const ref = layerRefs.current[layerConfig.topic];
  loadAndRenderGeoJsonLayer(url, mapRef.current!, ref, layerConfig.style);
});

    }
  }, [address]);

  // UI
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Sidebar */}
      <div style={{
        width: '320px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6',
        padding: '20px',
        overflowY: 'auto',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Map Layers
        </h3>
        
        {/* Search Form */}
        <form onSubmit={submitForm} style={{ marginBottom: '20px' }}>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            type="text"
            placeholder="Enter address to search"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '14px'
            }}
          />
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Search
          </button>
        </form>

        {/* Layer Toggle List */}
        <div>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#666',
            fontSize: '14px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Available Layers ({layerConfigs.length})
          </h4>
          
          {layerConfigs.map((layer) => (
            <div key={layer.topic} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span style={{
                fontSize: '13px',
                color: '#333',
                flex: 1,
                marginRight: '10px'
              }}>
                {formatLayerName(layer.topic)}
              </span>
              
              {searchCompleted && (
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={layerVisibility[layer.topic] || false}
                    onChange={() => toggleLayer(layer.topic)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: layerVisibility[layer.topic] ? '#007bff' : '#ccc',
                    borderRadius: '24px',
                    transition: '0.3s',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: layerVisibility[layer.topic] ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              )}
              
              {!searchCompleted && (
                <span style={{
                  fontSize: '11px',
                  color: '#999',
                  fontStyle: 'italic'
                }}>
                  Search first
                </span>
              )}
            </div>
          ))}
        </div>
        

      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
        
        {clickedCoordinate && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            Coordinates: {clickedCoordinate[0].toFixed(2)} / {clickedCoordinate[1].toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenLayersMap;
