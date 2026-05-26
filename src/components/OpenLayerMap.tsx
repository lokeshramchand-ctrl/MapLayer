import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Map, View } from 'ol';
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import { layerConfigs } from './Methods/Layers';
import { loadAndRenderGeoJsonLayer } from './Methods/GeoJson_Load';
import { addMarker } from './Methods/Marker';
import gsap from 'gsap';
import { useLocation, useNavigate } from 'react-router-dom';
import { easeOut } from 'ol/easing';
import {
  ArrowLeft,
  PanelLeft,
  PanelRight,
  Sun,
  Moon,
  PanelLeftClose,
  PanelRightClose,
  Sparkles,
  X,
  Send,
  RotateCcw,
  MapPin,
  Loader2
} from 'lucide-react';
import { getAISummary } from '../services/aiClient';

/* ─────────────────────────── Flat Themes ─────────────────────────── */
const themes = {
  dark: {
    bg: '#09090B',
    panelBg: '#18181B',
    panelBgHover: '#27272A',
    border: '#27272A',
    borderStrong: '#3F3F46',
    textMain: '#F4F4F5',
    textMuted: '#A1A1AA',
    textFaint: '#52525B',
    iconColor: '#F4F4F5',
    shadow: '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -1px rgba(0,0,0,0.3)',
    switchTrackActive: '#3B82F6', // Flat Blue
    switchTrackInactive: '#3F3F46',
    switchKnobActive: '#FFFFFF',
    switchKnobInactive: '#A1A1AA',
    mapUrl: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    accent: '#3B82F6',
    userBubble: '#27272A',
    aiBubble: '#1E3A8A', // Deep flat blue for AI
    inputBg: '#09090B',
    inputBorder: '#27272A',
    sendBtn: '#3B82F6',
    sendBtnText: '#FFFFFF',
    scrollThumb: '#3F3F46',
  },
  light: {
    bg: '#F9FAFB',
    panelBg: '#FFFFFF',
    panelBgHover: '#F3F4F6',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    textMain: '#111827',
    textMuted: '#6B7280',
    textFaint: '#9CA3AF',
    iconColor: '#111827',
    shadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
    switchTrackActive: '#2563EB',
    switchTrackInactive: '#D1D5DB',
    switchKnobActive: '#FFFFFF',
    switchKnobInactive: '#FFFFFF',
    mapUrl: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    accent: '#2563EB',
    userBubble: '#F3F4F6',
    aiBubble: '#EFF6FF', // Light flat blue for AI
    inputBg: '#F9FAFB',
    inputBorder: '#E5E7EB',
    sendBtn: '#2563EB',
    sendBtnText: '#FFFFFF',
    scrollThumb: '#D1D5DB',
  },
};

/* ─────────────────────────── Types ─────────────────────────── */
type AddressRecord = {
  lat: string | number;
  lon: string | number;
  display_name?: string;
  [key: string]: unknown;
};

type NearbyFeatureSummary = {
  layer: string;
  properties: Record<string, unknown>;
};

type AISummary = {
  summary: string;
  floodZone: { present: boolean; zoneType: string | null; source: string | null };
  parcels: { present: boolean; parcelId?: string | null; owner?: string | null; zoning?: string | null; source?: string | null } | null;
  missing_layers: string[];
};

type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

interface MapViewProps {
  initialAddressData: AddressRecord[] | null;
  initialTerm: string;
}

interface MapLocationState {
  addressData?: AddressRecord[];
  term?: string;
}

/* ─────────────────────── Helpers ─────────────────────── */
const extractColorFromStyle = (style: Style): string => {
  const strokeColor = style.getStroke()?.getColor?.();
  if (strokeColor) return String(strokeColor);
  const fillColor = style.getFill()?.getColor?.();
  if (fillColor) return String(fillColor);
  return '#888888';
};

const formatLayerName = (topic: string) =>
  topic.replace(/_/g, ' ').replace(/SD$/, '').trim();

const formatNumber = (value: number, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : '—';

const uid = () => Math.random().toString(36).slice(2, 9);

const QUICK_PROMPTS = [
  'Summarize risks near this address',
  'What flood zones are nearby?',
  'List active overlays and their significance',
  'Is this a high-risk area?',
];

const formatAISummary = (summary: AISummary): string => {
  const lines: string[] = [];
  lines.push(summary.summary);
  lines.push('');
  lines.push(`Flood zone: ${summary.floodZone.present ? summary.floodZone.zoneType ?? 'present' : 'not found'}`);
  if (summary.parcels) {
    lines.push(`Parcel: ${summary.parcels.present ? summary.parcels.parcelId ?? 'present' : 'not found'}`);
    if (summary.parcels.owner) lines.push(`Owner: ${summary.parcels.owner}`);
    if (summary.parcels.zoning) lines.push(`Zoning: ${summary.parcels.zoning}`);
  } else {
    lines.push('Parcel: not found');
  }
  if (summary.missing_layers?.length) {
    lines.push('');
    lines.push(`Missing layers: ${summary.missing_layers.join(', ')}`);
  }
  return lines.join('\n');
};

/* ─────────────────────────── Global styles ─────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--scroll-thumb); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--scroll-thumb-hover); }

  .ai-chat-panel {
    transition: transform 0.3s ease, opacity 0.2s ease;
  }
  .ai-chat-panel.open {
    transform: translateY(0);
    opacity: 1;
  }
  .ai-chat-panel.closed {
    transform: translateY(20px);
    opacity: 0;
    pointer-events: none;
  }

  .action-btn {
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }
  .action-btn:active { transform: scale(0.98); }

  .layer-row-item:hover { background: var(--panel-hover); }

  textarea:focus { outline: none; }
  textarea::placeholder { color: var(--placeholder); }
  
  @keyframes spin { 100% { transform: rotate(360deg); } }
  .spin-anim { animation: spin 1s linear infinite; }
`;

/* ══════════════════════════ Component ══════════════════════════ */
const MapView: React.FC<MapViewProps> = ({ initialAddressData, initialTerm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as MapLocationState | null) ?? null;
  const resolvedAddressData = locationState?.addressData ?? initialAddressData;
  const resolvedTerm = locationState?.term ?? initialTerm;

  /* ── Theme ── */
  const [isDarkMode, setIsDarkMode] = useState(true);
  const t = isDarkMode ? themes.dark : themes.light;

  /* ── Layer state ── */
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(layerConfigs.map((l) => [l.topic, true]))
  );
  const [clickedCoordinate, setClickedCoordinate] = useState<Coordinate>();
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [mapStats, setMapStats] = useState({
    zoom: 2,
    center: [0, 0] as Coordinate,
    rotation: 0,
    size: { width: 0, height: 0 },
  });

  /* ── Chat state ── */
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Map refs ── */
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const tileLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const markerLayerRef = useRef<VectorLayer | null>(null);
  const layerRefs = useRef<Record<string, React.MutableRefObject<VectorLayer | null>>>(
    Object.fromEntries(layerConfigs.map((l) => [l.topic, { current: null }]))
  );
  const uiContainerRef = useRef<HTMLDivElement>(null);

  /* ─────────────── Derived ─────────────── */
  const activeLayerNames = Object.entries(layerVisibility)
    .filter(([, v]) => v)
    .map(([topic]) => formatLayerName(topic));

  const activeLayerCount = Object.values(layerVisibility).filter(Boolean).length;
  const centerLonLat = toLonLat(mapStats.center);

  const collectNearbyFeatures = (): NearbyFeatureSummary[] => {
    const features: NearbyFeatureSummary[] = [];
    Object.entries(layerRefs.current).forEach(([name, ref]) => {
      const source = ref.current?.getSource();
      if (!source) return;
      source.getFeatures().slice(0, 20).forEach((f: { getProperties: () => Record<string, unknown> }) => {
        const props = { ...f.getProperties?.() };
        delete props.geometry;
        features.push({ layer: name, properties: props });
      });
    });
    return features;
  };

  const getAddressContext = () => {
    const src = resolvedAddressData?.[0];
    if (!src) return null;
    const lat = Number(src.lat);
    const lon = Number(src.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      address: resolvedTerm || src.display_name || 'Unknown address',
      coordinates: { lat, lon },
    };
  };

  /* ─────────────── AI call ─────────────── */
  const sendMessage = async (query: string) => {
    if (!query.trim() || aiLoading) return;
    const ctx = getAddressContext();

    const userMsg: ChatMessage = { id: uid(), role: 'user', text: query.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAiLoading(true);

    if (!ctx) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'ai', text: 'No location context found. Search for an address first.', timestamp: new Date() },
      ]);
      setAiLoading(false);
      return;
    }

    try {
      const summary = await getAISummary(
        { address: ctx.address, coordinates: ctx.coordinates, activeLayers: activeLayerNames, nearbyLayers: collectNearbyFeatures() },
        query.trim()
      );
      const text = formatAISummary(summary as AISummary);
      setMessages((prev) => [...prev, { id: uid(), role: 'ai', text, timestamp: new Date() }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const msg = message ? `Analysis failed: ${message}` : 'Analysis failed. Check connection and try again.';
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'ai', text: msg, timestamp: new Date() },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  /* ─────────────── Auto-scroll chat ─────────────── */
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, aiLoading]);

  /* ─────────────── Auto-resize textarea ─────────────── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputText]);

  /* ─────────────── Initial AI summary on address load ─────────────── */
  useEffect(() => {
    const src = resolvedAddressData?.[0];
    if (!src) return;
    const lat = Number(src.lat);
    const lon = Number(src.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    const timer = window.setTimeout(() => {
      void (async () => {
        setAiLoading(true);
        try {
          const summary = await getAISummary(
            {
              address: resolvedTerm || src.display_name || 'Unknown address',
              coordinates: { lat, lon },
              activeLayers: activeLayerNames,
              nearbyLayers: collectNearbyFeatures(),
            },
            'Summarize impacts near this property'
          );
          const text = formatAISummary(summary as AISummary);
          setMessages([{ id: uid(), role: 'ai', text, timestamp: new Date() }]);
        } catch {
          /* silent */
        } finally {
          setAiLoading(false);
        }
      })();
    }, 2000);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedAddressData, resolvedTerm]);

  /* ─────────────── Map init ─────────────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.floating-ui', {
        y: 10, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.2,
        clearProps: 'opacity,transform',
      });
    }, uiContainerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      const baseLayer = new TileLayer({
        source: new XYZ({ url: t.mapUrl, attributions: '&copy; OpenStreetMap &copy; CARTO' }),
      });
      tileLayerRef.current = baseLayer;
      const map = new Map({
        target: mapDivRef.current as HTMLDivElement,
        layers: [baseLayer],
        view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
        controls: [],
      });
      mapRef.current = map;
      map.on('click', (e) => setClickedCoordinate(e.coordinate));
      map.on('moveend', () => {
        const view = map.getView();
        const center = view.getCenter() ?? [0, 0];
        const zoom = view.getZoom() ?? 0;
        const rotation = view.getRotation() ?? 0;
        const size = map.getSize();
        setMapStats({ center, zoom, rotation, size: { width: size?.[0] ?? 0, height: size?.[1] ?? 0 } });
      });
    }
  }, [t.mapUrl]);

  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      tileLayerRef.current.setSource(new XYZ({ url: t.mapUrl, attributions: '&copy; OpenStreetMap &copy; CARTO' }));
    }
  }, [t.mapUrl, isDarkMode]);

  useEffect(() => {
    if (resolvedAddressData && resolvedAddressData.length > 0) {
      const lat = Number(resolvedAddressData[0].lat);
      const lon = Number(resolvedAddressData[0].lon);
      const coords = fromLonLat([lon, lat]);
      mapRef.current!.getView().animate({ center: coords, zoom: 20, duration: 2000, easing: easeOut });
      markerLayerRef.current = addMarker(coords, mapRef.current!, markerLayerRef.current);
      layerConfigs.forEach((lc) => {
        if (layerRefs.current[lc.topic].current) mapRef.current!.removeLayer(layerRefs.current[lc.topic].current!);
        const url = lc.getUrl(lon, lat, lc.radius);
        loadAndRenderGeoJsonLayer(url, mapRef.current!, layerRefs.current[lc.topic], lc.style);
      });
    }
  }, [resolvedAddressData]);

  const toggleLayer = (topic: string) => {
    const ref = layerRefs.current[topic];
    const next = !layerVisibility[topic];
    if (ref.current) ref.current.setVisible(next);
    setLayerVisibility((prev) => ({ ...prev, [topic]: next }));
  };

  const iconProps = { size: 18, color: t.iconColor, strokeWidth: 2 };

  /* ═══════════════════════ CSS vars injected via style attr ═══════════════════════ */
  const cssVars = {
    '--scroll-thumb': t.scrollThumb,
    '--scroll-thumb-hover': isDarkMode ? '#52525B' : '#9CA3AF',
    '--placeholder': t.textFaint,
    '--panel-hover': t.panelBgHover,
  } as React.CSSProperties;

  /* ════════════════════════════ RENDER ════════════════════════════ */
  return (
    <div
      style={{
        ...cssVars,
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: t.bg,
        overflow: 'hidden',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      }}
    >
      <style>{globalStyles}</style>

      {/* ── Map canvas ── */}
      <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />

      {/* ═══════════════ UI overlay ═══════════════ */}
      <div
        ref={uiContainerRef}
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 1000, padding: '24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}
      >
        {/* ─── Top bar ─── */}
        <div style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto', gap: '12px', width: '100%' }}>

          {/* Back */}
          <ActionButton onClick={() => navigate('/')} title="Go Back" t={t} className="floating-ui">
            <ArrowLeft {...iconProps} />
          </ActionButton>

          {/* Left sidebar toggle */}
          <ActionButton onClick={() => setShowLeftSidebar(!showLeftSidebar)} title="Toggle Layers" t={t} className="floating-ui">
            {showLeftSidebar ? <PanelLeftClose {...iconProps} /> : <PanelLeft {...iconProps} />}
          </ActionButton>

          {/* Location badge (Solid flat card) */}
          <div
            className="floating-ui"
            style={{
              display: 'flex', alignItems: 'center', padding: '0 16px', height: 44,
              borderRadius: 8, background: t.panelBg, border: `1px solid ${t.border}`,
              boxShadow: t.shadow, flexShrink: 0, gap: '8px',
            }}
          >
            <MapPin size={16} color={t.textMuted} />
            <span style={{ fontSize: 13, fontWeight: 500, color: t.textMain }}>
              {resolvedTerm || 'Exploring Map'}
            </span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Theme toggle */}
          <ActionButton onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Theme" t={t} className="floating-ui">
            {isDarkMode ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
          </ActionButton>

          {/* AI chat toggle */}
          <ActionButton
            onClick={() => setChatOpen(!chatOpen)}
            title="AI Location Intelligence"
            t={t}
            className="floating-ui"
            active={chatOpen}
            accent={t.accent}
          >
            <Sparkles size={18} color={chatOpen ? t.accent : t.iconColor} strokeWidth={2} />
          </ActionButton>

          {/* Right sidebar toggle */}
          <ActionButton onClick={() => setShowRightSidebar(!showRightSidebar)} title="Toggle Info Panel" t={t} className="floating-ui">
            {showRightSidebar ? <PanelRightClose {...iconProps} /> : <PanelRight {...iconProps} />}
          </ActionButton>
        </div>

        {/* ─── Bottom row: Left sidebar + HUD ─── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', pointerEvents: 'none' }}>

          {/* Left sidebar — Layer controls */}
          <div
            className="floating-ui custom-scrollbar"
            style={{
              width: 280,
              maxHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto',
              background: t.panelBg,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: '16px',
              boxShadow: t.shadow,
              transition: 'transform 0.3s ease, opacity 0.2s ease',
              transform: showLeftSidebar ? 'translateX(0)' : 'translateX(calc(-100% - 32px))',
              opacity: showLeftSidebar ? 1 : 0,
              visibility: showLeftSidebar ? 'visible' : 'hidden',
            }}
          >
            <div style={{
              fontSize: 12, fontWeight: 600, color: t.textMain,
              marginBottom: 12, borderBottom: `1px solid ${t.border}`, paddingBottom: 10,
            }}>
              Overlays
            </div>
            <div className="custom-scrollbar" style={{ overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {layerConfigs.map((layer) => {
                const isActive = layerVisibility[layer.topic];
                const layerColor = extractColorFromStyle(layer.style);
                return (
                  <div
                    key={layer.topic}
                    className="layer-row-item"
                    onClick={() => toggleLayer(layer.topic)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer', padding: '8px', borderRadius: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 2, // square color indicator
                        backgroundColor: layerColor, opacity: isActive ? 1 : 0.4, flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 13, color: isActive ? t.textMain : t.textMuted,
                        fontWeight: isActive ? 500 : 400,
                      }}>
                        {formatLayerName(layer.topic)}
                      </span>
                    </div>
                    {/* Minimal flat toggle switch */}
                    <div style={{
                      width: 28, height: 16, borderRadius: 99,
                      background: isActive ? t.switchTrackActive : t.switchTrackInactive,
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: '50%',
                        position: 'absolute', top: 2,
                        left: isActive ? 14 : 2,
                        background: isActive ? t.switchKnobActive : t.switchKnobInactive,
                        transition: 'left 0.2s ease',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HUD */}
          {clickedCoordinate && (
            <div style={{
              fontFamily: 'monospace',
              fontSize: 11, color: t.textFaint, pointerEvents: 'auto',
              padding: '6px 12px', background: t.panelBg,
              borderRadius: 6, border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
            }}>
              {clickedCoordinate[1].toFixed(4)}, {clickedCoordinate[0].toFixed(4)}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ Right Sidebar ═══════════════ */}
      <div
        className="floating-ui"
        style={{
          position: 'absolute', top: 84, right: 24,
          width: 280, maxHeight: 'calc(100% - 120px)',
          display: 'flex', flexDirection: 'column', gap: 12,
          pointerEvents: 'auto', zIndex: 1100,
          transform: showRightSidebar ? 'translateX(0)' : 'translateX(calc(100% + 32px))',
          opacity: showRightSidebar ? 1 : 0,
          visibility: showRightSidebar ? 'visible' : 'hidden',
          transition: 'transform 0.3s ease, opacity 0.2s ease',
        }}
      >
        {/* General values */}
        <SidebarCard t={t} title="Map Status">
          <StatRow t={t} label="Zoom" value={formatNumber(mapStats.zoom, 2)} />
          <StatRow t={t} label="Center" value={`${formatNumber(centerLonLat[1], 3)}, ${formatNumber(centerLonLat[0], 3)}`} />
          <StatRow t={t} label="Viewport" value={mapStats.size.width ? `${mapStats.size.width}x${mapStats.size.height}` : '—'} />
          <StatRow t={t} label="Layers Active" value={`${activeLayerCount} of ${layerConfigs.length}`} last={true} />
        </SidebarCard>

        {/* Layer meta */}
        <SidebarCard t={t} title="Active Buffers">
          <div className="custom-scrollbar" style={{ maxHeight: '30vh', overflowY: 'auto', paddingRight: 4 }}>
            {layerConfigs.map((layer) => {
              const isActive = layerVisibility[layer.topic];
              if (!isActive) return null; // Only show active on the right panel for a cleaner look
              const layerColor = extractColorFromStyle(layer.style);
              return (
                <div key={layer.topic} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 0', borderBottom: `1px solid ${t.border}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: t.textMain }}>
                    <span style={{ width: 8, height: 8, backgroundColor: layerColor, flexShrink: 0, borderRadius: 2 }} />
                    {formatLayerName(layer.topic)}
                  </div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>{layer.radius}m</div>
                </div>
              );
            })}
          </div>
        </SidebarCard>
      </div>

      {/* ═══════════════ AI Chat Panel ═══════════════ */}
      <div
        className={`ai-chat-panel ${chatOpen ? 'open' : 'closed'}`}
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          marginLeft: '-240px', // center standard fixed width
          width: 480,
          zIndex: 2000,
          pointerEvents: chatOpen ? 'auto' : 'none',
        }}
      >
        <div style={{
          background: t.panelBg,
          border: `1px solid ${t.borderStrong}`,
          borderRadius: 12,
          boxShadow: t.shadow,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Chat header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${t.border}`,
            background: t.panelBgHover
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles size={16} color={t.accent} />
              <div style={{ fontSize: 14, fontWeight: 600, color: t.textMain }}>
                AI Assistant
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {messages.length > 0 && (
                <button
                  className="action-btn"
                  onClick={() => setMessages([])}
                  title="Clear chat"
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: 'none',
                    background: 'transparent', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: t.textMuted
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = t.border}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <RotateCcw size={14} />
                </button>
              )}
              <button
                className="action-btn"
                onClick={() => setChatOpen(false)}
                title="Close"
                style={{
                  width: 28, height: 28, borderRadius: 6, border: 'none',
                  background: 'transparent', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: t.textMuted
                }}
                onMouseOver={(e) => e.currentTarget.style.background = t.border}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatScrollRef}
            className="custom-scrollbar"
            style={{
              height: 340,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.length === 0 && !aiLoading && (
              <div style={{ margin: 'auto', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: t.textFaint, lineHeight: 1.5 }}>
                  Ask about risk overlays, flood zones, <br/> or location intelligence.
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: msg.role === 'user' ? t.userBubble : t.aiBubble,
                  border: msg.role === 'ai' ? `1px solid ${t.border}` : 'none',
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: t.textMain,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Flat loading state */}
            {aiLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', color: t.textMuted, fontSize: 13 }}>
                <Loader2 size={14} className="spin-anim" />
                Processing request...
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length === 0 && (
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto', flexWrap: 'nowrap' }} className="custom-scrollbar">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { void sendMessage(p); }}
                  style={{
                    flexShrink: 0, padding: '6px 10px',
                    borderRadius: 6, border: `1px solid ${t.border}`,
                    background: t.bg, color: t.textMuted,
                    fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = t.textMuted; e.currentTarget.style.color = t.textMain; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textMuted; }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div style={{
            padding: '12px 16px',
            borderTop: `1px solid ${t.border}`,
            background: t.panelBg,
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage(inputText);
                }
              }}
              placeholder="Type your question..."
              rows={1}
              style={{
                flex: 1, resize: 'none', overflowY: 'hidden',
                background: t.inputBg, border: `1px solid ${t.inputBorder}`,
                borderRadius: 6, color: t.textMain, padding: '8px 12px',
                fontSize: 13, lineHeight: 1.5, minHeight: 36, maxHeight: 120,
              }}
            />
            <button
              onClick={() => { void sendMessage(inputText); }}
              disabled={!inputText.trim() || aiLoading}
              style={{
                width: 36, height: 36, borderRadius: 6,
                background: inputText.trim() && !aiLoading ? t.sendBtn : t.borderStrong,
                border: 'none', cursor: inputText.trim() && !aiLoading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Send size={16} color={inputText.trim() && !aiLoading ? t.sendBtnText : t.textMuted} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════ Sub-components ═══════════════════════ */

const ActionButton: React.FC<{
  onClick: () => void;
  title: string;
  t: typeof themes.dark;
  className?: string;
  children: React.ReactNode;
  active?: boolean;
  accent?: string;
}> = ({ onClick, title, t, className, children, active, accent }) => (
  <button
    className={`action-btn ${className ?? ''}`}
    onClick={onClick}
    title={title}
    style={{
      width: 40, height: 40, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: t.panelBg,
      border: `1px solid ${active && accent ? accent : t.border}`,
      color: active && accent ? accent : t.textMain,
      cursor: 'pointer', flexShrink: 0,
      boxShadow: t.shadow,
    }}
  >
    {children}
  </button>
);

const SidebarCard: React.FC<{ t: typeof themes.dark; title: string; children: React.ReactNode }> = ({ t, title, children }) => (
  <div style={{
    background: t.panelBg, border: `1px solid ${t.border}`, borderRadius: 12,
    padding: '14px 16px', boxShadow: t.shadow,
  }}>
    <div style={{
      fontSize: 12, fontWeight: 600, color: t.textMain, marginBottom: 10,
      borderBottom: `1px solid ${t.border}`, paddingBottom: 8,
    }}>
      {title}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  </div>
);

const StatRow: React.FC<{ t: typeof themes.dark; label: string; value: string; last?: boolean }> = ({ t, label, value, last }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 0', borderBottom: last ? 'none' : `1px solid ${t.border}`,
  }}>
    <span style={{ fontSize: 13, color: t.textMuted }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500, color: t.textMain }}>{value}</span>
  </div>
);

export default MapView;