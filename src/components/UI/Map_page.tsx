import { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import './Map_page.css';
import Dock from './Dock';
// ✅ Make sure these are imported from 'react-icons/vsc'
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';

const Map_page = () => {
  const mapRef = useRef<Map | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = new Map({
        target: mapDivRef.current as HTMLDivElement,
        layers: [new TileLayer({ source: new OSM() })],
        view: new View({
          center: fromLonLat([-117.1611, 32.7157]), // Default to San Diego
          zoom: 10,
        }),
      });
      mapRef.current = map;
    }
  }, []);

  const items = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
  ];

  return (
    <>
      <div className="container">
        <div className="map-container">
          <div ref={mapDivRef} className="map" />
        </div>

        <div className="sidebar">
          <input type="text" placeholder="Enter a location..." className="input-field" />
          <button className="submit">Submit</button>
        </div>

        <Dock

          items={items}

          panelHeight={68}

          baseItemSize={50}

          magnification={70}

        />
      </div>
    </>
  );
};

export default Map_page;
