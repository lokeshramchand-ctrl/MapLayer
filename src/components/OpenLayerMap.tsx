import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Map, View } from 'ol';
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import { layerConfigs } from './Methods/Layers';
import { loadAndRenderGeoJsonLayer } from './Methods/GeoJson_Load';
import { addMarker } from './Methods/Marker';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { easeOut } from 'ol/easing';

// --- THEME CONFIGURATION ---
const themes = {
  dark: {
    bg: '#050505',
    glass: 'rgba(20, 20, 20, 0.75)', // Slightly darker for better contrast
    border: 'rgba(255, 255, 255, 0.15)', // Stronger border
    textMain: '#ffffff',
    textMuted: '#AAAAAA',
    iconColor: '#ffffff',
    shadow: '0 4px 20px rgba(0,0,0,0.4)', // Strong shadow
    switchTrackActive: 'rgba(255,255,255,0.2)',
    switchTrackInactive: 'rgba(255,255,255,0.05)',
    switchKnobActive: '#fff',
    switchKnobInactive: '#666',
    mapUrl: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  },
  light: {
    bg: '#F4F4F5',
    glass: 'rgba(255, 255, 255, 0.90)', // More opaque for visibility
    border: 'rgba(0, 0, 0, 0.1)',
    textMain: '#18181B',
    textMuted: '#52525B',
    iconColor: '#18181B',
    shadow: '0 4px 20px rgba(0,0,0,0.1)',
    switchTrackActive: 'rgba(0,0,0,0.2)',
    switchTrackInactive: 'rgba(0,0,0,0.05)',
    switchKnobActive: '#000',
    switchKnobInactive: '#999',
    mapUrl: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  }
};

// --- SCROLLBAR CSS ---
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.5); }
`;

// --- HELPER: Extract Color ---
const extractColorFromStyle = (style: any): string => {
  let color: any = '#888888';
  if (style.getStroke() && style.getStroke().getColor()) color = style.getStroke().getColor();
  else if (style.getFill() && style.getFill().getColor()) color = style.getFill().getColor();

  const colorMap: Record<string, string> = {
    'skin': '#FFCBA4', 'darkyellow': '#FCC200', 'darkblue': '#00008B',
    'darkgreen': '#006400', 'purple': '#800080', 'orange': '#FFA500',
    'green': '#00FF00', 'blue': '#0000FF', 'red': '#FF0000', 'black': '#888888',
  };
  return colorMap[color] || color;
};

interface MapViewProps {
  initialAddressData: any;
  initialTerm: string;
}

const MapView: React.FC<MapViewProps> = ({ initialAddressData, initialTerm }) => {
  const navigate = useNavigate();
  
  // -- STATE --
  const [isDarkMode, setIsDarkMode] = useState(true);
  const currentTheme = isDarkMode ? themes.dark : themes.light;

  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(() => 
    Object.fromEntries(layerConfigs.map(layer => [layer.topic, true]))
  );
  const [clickedCoordinate, setClickedCoordinate] = useState<Coordinate>();
  const [mapStats, setMapStats] = useState({
    zoom: 2,
    center: [0, 0] as Coordinate,
    rotation: 0,
    size: { width: 0, height: 0 }
  });

  // -- REFS --
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const tileLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const markerLayerRef = useRef<VectorLayer | null>(null);
  const layerRefs = useRef<Record<string, React.MutableRefObject<VectorLayer | null>>>(
    Object.fromEntries(layerConfigs.map((layer) => [layer.topic, { current: null }]))
  );
  const uiContainerRef = useRef<HTMLDivElement>(null);

  // -- GSAP ENTRANCE --
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // We use clearProps: 'all' to ensure GSAP doesn't leave the elements with weird opacity states
      gsap.from('.floating-ui', {
        y: 20, 
        opacity: 0, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: 'power3.out', 
        delay: 0.5,
        clearProps: 'opacity,transform' // Crucial: Ensures visibility after animation ends
      });
    }, uiContainerRef);
    return () => ctx.revert();
  }, []);

  // -- MAP INIT --
  useEffect(() => {
    if (!mapRef.current) {
      const baseLayer = new TileLayer({
        source: new XYZ({
          url: currentTheme.mapUrl,
          attributions: '&copy; OpenStreetMap &copy; CARTO'
        })
      });
      tileLayerRef.current = baseLayer;

      const map = new Map({
        target: mapDivRef.current as HTMLDivElement,
        layers: [ baseLayer ],
        view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
        controls: []
      });

      mapRef.current = map;
      map.on('click', (e) => setClickedCoordinate(e.coordinate));
      map.on('moveend', () => {
        const view = map.getView();
        const center = view.getCenter() ?? [0, 0];
        const zoom = view.getZoom() ?? 0;
        const rotation = view.getRotation() ?? 0;
        const size = map.getSize();

        setMapStats({
          center,
          zoom,
          rotation,
          size: { width: size?.[0] ?? 0, height: size?.[1] ?? 0 }
        });
      });
    }
  }, []);

  // -- THEME SWITCHING --
  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
        tileLayerRef.current.setSource(new XYZ({
            url: currentTheme.mapUrl,
            attributions: '&copy; OpenStreetMap &copy; CARTO'
        }));
    }
  }, [isDarkMode]);

  // -- SEARCH DATA --
  useEffect(() => {
    if (initialAddressData && initialAddressData.length > 0) {
      const lat = parseFloat(initialAddressData[0].lat);
      const lon = parseFloat(initialAddressData[0].lon);
      const coords = fromLonLat([lon, lat]);

      mapRef.current!.getView().animate({ center: coords, zoom: 14, duration: 2500, easing: easeOut });
      markerLayerRef.current = addMarker(coords, mapRef.current!, markerLayerRef.current);
      
      layerConfigs.forEach((layerConfig) => {
        if(layerRefs.current[layerConfig.topic].current) mapRef.current!.removeLayer(layerRefs.current[layerConfig.topic].current!);
        const url = layerConfig.getUrl(lon, lat, layerConfig.radius);
        const ref = layerRefs.current[layerConfig.topic];
        loadAndRenderGeoJsonLayer(url, mapRef.current!, ref, layerConfig.style);
      });
    }
  }, [initialAddressData]);

  const toggleLayer = (layerTopic: string) => {
    const layerRef = layerRefs.current[layerTopic];
    const isVisible = !layerVisibility[layerTopic];
    if (layerRef.current) layerRef.current.setVisible(isVisible);
    setLayerVisibility(prev => ({ ...prev, [layerTopic]: isVisible }));
  };

  const formatLayerName = (topic: string) => topic.replace(/_/g, ' ').replace(/SD$/, '').trim();
  const formatNumber = (value: number, digits = 2) => Number.isFinite(value) ? value.toFixed(digits) : '—';
  const centerLonLat = toLonLat(mapStats.center);
  const clickedLonLat = clickedCoordinate ? toLonLat(clickedCoordinate) : null;
  const activeLayerCount = Object.values(layerVisibility).filter(Boolean).length;

  // -- STYLES --
  const styles = {
    wrapper: {
      position: 'relative' as const, width: '100vw', height: '100vh',
      background: currentTheme.bg, overflow: 'hidden',
      fontFamily: '"Inter", -apple-system, sans-serif',
      transition: 'background 0.5s ease',
    },
    uiLayer: {
      position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none' as const, 
      zIndex: 1000, // FORCE TOP LAYER
      padding: '24px',
      display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between',
    },
    topBar: { 
        display: 'flex', 
        alignItems: 'center', 
        pointerEvents: 'auto' as const,
        gap: '12px',
        width: '100%' // Ensure it spans width
    },
    glassPanel: {
        background: currentTheme.glass,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '20px', padding: '40px',
        boxShadow: currentTheme.shadow,
        transition: 'all 0.3s ease'
    },
    locationBadge: {
        display: 'flex', alignItems: 'center', padding: '12px 24px',
        borderRadius: '30px', background: currentTheme.glass,
        backdropFilter: 'blur(20px)', border: `1px solid ${currentTheme.border}`,
        boxShadow: currentTheme.shadow,
        transition: 'all 0.3s ease',
        flexShrink: 0 // Prevent collapsing
    },
    actionButton: {
      width: '48px', height: '48px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: currentTheme.glass, 
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${currentTheme.border}`, 
      color: currentTheme.iconColor, // Explicit high contrast color
      boxShadow: currentTheme.shadow, // Force visibility
      cursor: 'pointer', transition: 'all 0.2s',
      flexShrink: 0 // Prevent collapsing
    },
    controlsContainer: {
      marginTop: 'auto', maxWidth: '340px', maxHeight: '60vh',
      display: 'flex', flexDirection: 'column' as const, pointerEvents: 'auto' as const,
      background: currentTheme.glass, backdropFilter: 'blur(20px)',
      border: `1px solid ${currentTheme.border}`, borderRadius: '10px', padding: '20px',
      boxShadow: currentTheme.shadow, transition: 'all 0.3s ease'
    },
    controlsHeader: {
        flexShrink: 0, fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
        color: currentTheme.textMuted, marginBottom: '16px', textTransform: 'uppercase' as const,
        borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: '12px'
    },
    scrollableList: { overflowY: 'auto' as const, paddingRight: '8px' },
    layerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', cursor: 'pointer', padding: '4px 8px' },
    layerLabel: { display: 'flex', alignItems: 'center', gap: '12px' },
    switchTrack: { width: '32px', height: '18px', borderRadius: '10px', position: 'relative' as const, transition: 'background 0.3s ease' },
    switchKnob: { width: '14px', height: '14px', borderRadius: '50%', position: 'absolute' as const, top: '2px', transition: 'left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    hud: {
        position: 'absolute' as const, bottom: '24px', right: '24px',
        fontFamily: '"JetBrains Mono", monospace', fontSize: '10px',
        color: currentTheme.textMuted, pointerEvents: 'auto' as const,
        padding: '8px 12px', background: currentTheme.glass,
        borderRadius: '8px', border: `1px solid ${currentTheme.border}`,
        boxShadow: currentTheme.shadow,
        transition: 'background 0.3s, color 0.3s'
    },
    rightSidebar: {
      position: 'absolute' as const,
      top: '92px',
      right: '24px',
      width: '320px',
      maxHeight: 'calc(100% - 140px)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      pointerEvents: 'auto' as const,
      zIndex: 1100
    },
    sidebarCard: {
      background: currentTheme.glass,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${currentTheme.border}`,
      borderRadius: '16px',
      padding: '16px',
      boxShadow: currentTheme.shadow,
      transition: 'all 0.3s ease'
    },
    sidebarTitle: {
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '1px',
      color: currentTheme.textMuted,
      textTransform: 'uppercase' as const,
      marginBottom: '12px'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: `1px dashed ${currentTheme.border}`
    },
    statLabel: {
      fontSize: '12px',
      color: currentTheme.textMuted
    },
    statValue: {
      fontSize: '12px',
      fontWeight: 600,
      color: currentTheme.textMain
    },
    layerMetaRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      borderBottom: `1px dashed ${currentTheme.border}`
    },
    layerMetaName: {
      fontSize: '12px',
      color: currentTheme.textMain,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    layerMetaBadge: {
      fontSize: '10px',
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: '999px',
      border: `1px solid ${currentTheme.border}`,
      color: currentTheme.textMuted
    }
  };

  return (
    <div style={styles.wrapper}>
      <style>{scrollbarStyles}</style>

      {/* 1. MAP LAYER */}
      <div 
        ref={mapDivRef} 
        style={{ width: '100%', height: '100%', transition: 'filter 0.5s' }} 
      />

      {/* 2. UI LAYER */}
      <div ref={uiContainerRef} style={styles.uiLayer}>
        
        {/* TOP BAR */}
        <div style={styles.topBar}>
            
            {/* Back Button */}
            <button 
                className="floating-ui"
                style={styles.actionButton}
                onClick={() => navigate('/')}
                title="Go Back"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = currentTheme.border}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>

            {/* Location Badge */}
            <div className="floating-ui" style={styles.locationBadge}>
                <div style={{ width: '6px', height: '6px', background: '#00FF94', borderRadius: '50%', marginRight: '12px', boxShadow: '0 0 8px #00FF94' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.5px', color: currentTheme.textMain, textTransform: 'uppercase' }}>
                    {initialTerm || "Exploring View"}
                </span>
            </div>

            {/* Theme Toggle Button */}
            <button 
                className="floating-ui"
                style={styles.actionButton}
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Theme"
                onMouseEnter={(e) => e.currentTarget.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = currentTheme.border}
            >
               {isDarkMode ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
               ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
               )}
            </button>

        </div>

        {/* CONTROLS */}
        <div className="floating-ui" style={styles.controlsContainer}>
            <div style={styles.controlsHeader}>Overlay Controls</div>
            
            <div className="custom-scrollbar" style={styles.scrollableList}>
                {layerConfigs.map((layer) => {
                    const isActive = layerVisibility[layer.topic];
                    const layerColor = extractColorFromStyle(layer.style);

                    return (
                        <div key={layer.topic} style={styles.layerRow} onClick={() => toggleLayer(layer.topic)}>
                            <div style={styles.layerLabel}>
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    backgroundColor: layerColor,
                                    boxShadow: `0 0 8px ${layerColor}`,
                                    opacity: isActive ? 1 : 0.3, transition: 'all 0.3s'
                                }} />
                                <span style={{ fontSize: '13px', color: isActive ? currentTheme.textMain : currentTheme.textMuted, transition: 'color 0.3s' }}>
                                    {formatLayerName(layer.topic)}
                                </span>
                            </div>
                            
                            <div style={{ ...styles.switchTrack, background: isActive ? currentTheme.switchTrackActive : currentTheme.switchTrackInactive }}>
                                <div style={{ ...styles.switchKnob, left: isActive ? '16px' : '2px', background: isActive ? currentTheme.switchKnobActive : currentTheme.switchKnobInactive }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* HUD */}
        {clickedCoordinate && (
            <div className="floating-ui" style={styles.hud}>
                LOCATION_LOCK: {clickedCoordinate[1].toFixed(4)} N, {clickedCoordinate[0].toFixed(4)} E
            </div>
        )}

        {/* RIGHT SIDEBAR */}
        <div className="floating-ui" style={styles.rightSidebar}>
          <div style={styles.sidebarCard}>
            <div style={styles.sidebarTitle}>General Values</div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Height</span>
              <span style={styles.statValue}>{mapStats.size.height ? `${mapStats.size.height}px` : '—'}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Depth</span>
              <span style={styles.statValue}>{mapStats.size.width ? `${mapStats.size.width}px` : '—'}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Zoom</span>
              <span style={styles.statValue}>{formatNumber(mapStats.zoom, 2)}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Center</span>
              <span style={styles.statValue}>{formatNumber(centerLonLat[1], 4)} N / {formatNumber(centerLonLat[0], 4)} E</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Last Click</span>
              <span style={styles.statValue}>{clickedLonLat ? `${formatNumber(clickedLonLat[1], 4)} N / ${formatNumber(clickedLonLat[0], 4)} E` : '—'}</span>
            </div>
            <div style={{ ...styles.statRow, borderBottom: 'none' }}>
              <span style={styles.statLabel}>Layers On</span>
              <span style={styles.statValue}>{activeLayerCount}/{layerConfigs.length}</span>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <div style={styles.sidebarTitle}>Layer Values</div>
            <div className="custom-scrollbar" style={{ maxHeight: '36vh', overflowY: 'auto', paddingRight: '6px' }}>
              {layerConfigs.map((layer) => {
                const isActive = layerVisibility[layer.topic];
                const layerColor = extractColorFromStyle(layer.style);

                return (
                  <div key={layer.topic} style={{ ...styles.layerMetaRow, borderBottom: `1px dashed ${currentTheme.border}` }}>
                    <div style={styles.layerMetaName}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: layerColor, boxShadow: `0 0 8px ${layerColor}`, opacity: isActive ? 1 : 0.3 }} />
                      {formatLayerName(layer.topic)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={styles.layerMetaBadge}>{layer.radius}m</span>
                      <span style={{ ...styles.layerMetaBadge, color: isActive ? currentTheme.textMain : currentTheme.textMuted }}>
                        {isActive ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MapView;