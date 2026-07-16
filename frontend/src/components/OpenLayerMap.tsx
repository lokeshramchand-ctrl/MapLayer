import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Map, View } from "ol";
import "ol/ol.css";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import VectorLayer from "ol/layer/Vector";
import { layerConfigs } from "./Methods/Layers";
import { loadAndRenderGeoJsonLayer } from "./Methods/GeoJson_Load";
import { addMarker } from "./Methods/Marker";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { easeOut } from "ol/easing";
import {
  ArrowLeft,
  PanelLeft,
  PanelRight,
  Sun,
  Moon,
  PanelLeftClose,
  PanelRightClose,
  MessageSquare,
  Send,
  X,
} from "lucide-react";

const themes = {
  dark: {
    bg: "#050505",
    glass: "rgba(20, 20, 20, 0.75)",
    border: "rgba(255, 255, 255, 0.15)",
    textMain: "#ffffff",
    textMuted: "#AAAAAA",
    iconColor: "#ffffff",
    shadow: "0 4px 20px rgba(0,0,0,0.4)",
    switchTrackActive: "rgba(255,255,255,0.2)",
    switchTrackInactive: "rgba(255,255,255,0.05)",
    switchKnobActive: "#fff",
    switchKnobInactive: "#666",
    mapUrl: "https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    chatBg: "rgba(30, 30, 30, 0.85)",
    aiBubble: "rgba(50, 50, 50, 0.9)",
    userBubble: "rgba(0, 122, 255, 0.8)",
  },
  light: {
    bg: "#F4F4F5",
    glass: "rgba(255, 255, 255, 0.90)",
    border: "rgba(0, 0, 0, 0.1)",
    textMain: "#18181B",
    textMuted: "#52525B",
    iconColor: "#18181B",
    shadow: "0 4px 20px rgba(0,0,0,0.1)",
    switchTrackActive: "rgba(0,0,0,0.2)",
    switchTrackInactive: "rgba(0,0,0,0.05)",
    switchKnobActive: "#000",
    switchKnobInactive: "#999",
    mapUrl: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    chatBg: "rgba(255, 255, 255, 0.85)",
    aiBubble: "rgba(230, 230, 230, 0.9)",
    userBubble: "rgba(0, 122, 255, 0.9)",
  },
};

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 128, 128, 0.1); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 128, 128, 0.3); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(128, 128, 128, 0.5); }
`;

const extractColorFromStyle = (style: any): string => {
  if (style.getStroke() && style.getStroke().getColor())
    return style.getStroke().getColor();
  if (style.getFill() && style.getFill().getColor())
    return style.getFill().getColor();
  return "#888888";
};

interface MapViewProps {
  initialAddressData: any;
  initialTerm: string;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

const MapView: React.FC<MapViewProps> = ({
  initialAddressData,
  initialTerm,
}) => {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const currentTheme = isDarkMode ? themes.dark : themes.light;

  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(layerConfigs.map((layer) => [layer.topic, true])));

  const [clickedCoordinate, setClickedCoordinate] = useState<Coordinate>();
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      content:
        "Hello! I am your spatial AI agent. Ask me about property zones, hazards, or safety data.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [mapStats, setMapStats] = useState({
    zoom: 2,
    center: [0, 0] as Coordinate,
    rotation: 0,
    size: { width: 0, height: 0 },
  });

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const tileLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const markerLayerRef = useRef<VectorLayer | null>(null);
  const layerRefs = useRef<
    Record<string, React.MutableRefObject<VectorLayer | null>>
  >(
    Object.fromEntries(
      layerConfigs.map((layer) => [layer.topic, { current: null }]),
    ),
  );
  const uiContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".floating-ui", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
        clearProps: "opacity,transform",
      });
    }, uiContainerRef);
    return () => ctx.revert();
  }, []);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!mapRef.current) {
      const baseLayer = new TileLayer({
        source: new XYZ({
          url: currentTheme.mapUrl,
          attributions: "&copy; OpenStreetMap &copy; CARTO",
        }),
      });
      tileLayerRef.current = baseLayer;

      const map = new Map({
        target: mapDivRef.current as HTMLDivElement,
        layers: [baseLayer],
        view: new View({ center: fromLonLat([0, 0]), zoom: 2 }),
        controls: [],
      });

      mapRef.current = map;
      map.on("click", (e) => setClickedCoordinate(e.coordinate));
      map.on("moveend", () => {
        const view = map.getView();
        setMapStats({
          center: view.getCenter() ?? [0, 0],
          zoom: view.getZoom() ?? 0,
          rotation: view.getRotation() ?? 0,
          size: {
            width: map.getSize()?.[0] ?? 0,
            height: map.getSize()?.[1] ?? 0,
          },
        });
      });
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      tileLayerRef.current.setSource(
        new XYZ({
          url: currentTheme.mapUrl,
          attributions: "&copy; OpenStreetMap &copy; CARTO",
        }),
      );
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (initialAddressData && initialAddressData.length > 0) {
      const lat = parseFloat(initialAddressData[0].lat);
      const lon = parseFloat(initialAddressData[0].lon);
      const coords = fromLonLat([lon, lat]);

      mapRef
        .current!.getView()
        .animate({ center: coords, zoom: 20, duration: 2500, easing: easeOut });
      markerLayerRef.current = addMarker(
        coords,
        mapRef.current!,
        markerLayerRef.current,
      );

      layerConfigs.forEach((layerConfig) => {
        if (layerRefs.current[layerConfig.topic].current)
          mapRef.current!.removeLayer(
            layerRefs.current[layerConfig.topic].current!,
          );
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
    setLayerVisibility((prev) => ({ ...prev, [layerTopic]: isVisible }));
  };

  const formatLayerName = (topic: string) =>
    topic.replace(/_/g, " ").replace(/SD$/, "").trim();
  const formatNumber = (value: number, digits = 2) =>
    Number.isFinite(value) ? value.toFixed(digits) : "—";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setIsTyping(true);

    try {
      // Point this to wherever FastAPI is running (e.g., localhost or 10.10.10.100)
      const response = await fetch(
        "https://backend.deploy.lokeshrc.me/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMessage }),
        },
      );

      const data = await response.json();

      if (data.message) {
        setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Sorry, I received an empty response." },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, I encountered an error checking that data.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  const centerLonLat = toLonLat(mapStats.center);
  const clickedLonLat = clickedCoordinate ? toLonLat(clickedCoordinate) : null;
  const activeLayerCount =
    Object.values(layerVisibility).filter(Boolean).length;

  const iconProps = {
    size: 20,
    color: currentTheme.iconColor,
    stroke: currentTheme.iconColor,
    strokeWidth: 2.2,
  };
  const iconSmallProps = {
    size: 16,
    color: currentTheme.iconColor,
    stroke: currentTheme.iconColor,
    strokeWidth: 2.2,
  };

  const styles = {
    wrapper: {
      position: "relative" as const,
      width: "100vw",
      height: "100vh",
      background: currentTheme.bg,
      overflow: "hidden",
      fontFamily: '"Inter", -apple-system, sans-serif',
      transition: "background 0.5s ease",
    },
    uiLayer: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none" as const,
      zIndex: 1000,
      padding: "24px",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "space-between",
    },
    topBar: {
      display: "flex",
      alignItems: "center",
      pointerEvents: "auto" as const,
      gap: "12px",
      width: "100%",
    },
    locationBadge: {
      display: "flex",
      alignItems: "center",
      padding: "12px 24px",
      borderRadius: "30px",
      background: currentTheme.glass,
      backdropFilter: "blur(20px)",
      border: `1px solid ${currentTheme.border}`,
      boxShadow: currentTheme.shadow,
      transition: "all 0.3s ease",
      flexShrink: 0,
    },
    actionButton: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: currentTheme.glass,
      backdropFilter: "blur(20px)",
      border: `1px solid ${currentTheme.border}`,
      color: currentTheme.iconColor,
      boxShadow: currentTheme.shadow,
      cursor: "pointer",
      transition: "all 0.2s",
      flexShrink: 0,
    },
    controlsContainer: {
      marginTop: "auto",
      maxWidth: "340px",
      maxHeight: "60vh",
      display: "flex",
      flexDirection: "column" as const,
      pointerEvents: "auto" as const,
      background: currentTheme.glass,
      backdropFilter: "blur(20px)",
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "10px",
      padding: "20px",
      boxShadow: currentTheme.shadow,
      transition: "all 0.3s ease",
      transform: showLeftSidebar
        ? "translateX(0)"
        : "translateX(calc(-100% - 32px))",
      opacity: showLeftSidebar ? 1 : 0,
      visibility: showLeftSidebar ? ("visible" as const) : ("hidden" as const),
    },
    controlsHeader: {
      flexShrink: 0,
      fontSize: "10px",
      fontWeight: 700,
      letterSpacing: "1px",
      color: currentTheme.textMuted,
      marginBottom: "16px",
      textTransform: "uppercase" as const,
      borderBottom: `1px solid ${currentTheme.border}`,
      paddingBottom: "12px",
    },
    scrollableList: { overflowY: "auto" as const, paddingRight: "8px" },
    layerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
      cursor: "pointer",
      padding: "4px 8px",
    },
    layerLabel: { display: "flex", alignItems: "center", gap: "12px" },
    switchTrack: {
      width: "32px",
      height: "18px",
      borderRadius: "10px",
      position: "relative" as const,
      transition: "background 0.3s ease",
    },
    switchKnob: {
      width: "14px",
      height: "14px",
      borderRadius: "50%",
      position: "absolute" as const,
      top: "2px",
      transition: "left 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
    },
    hud: {
      position: "absolute" as const,
      bottom: "24px",
      right: "24px",
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "10px",
      color: currentTheme.textMuted,
      pointerEvents: "auto" as const,
      padding: "8px 12px",
      background: currentTheme.glass,
      borderRadius: "8px",
      border: `1px solid ${currentTheme.border}`,
      boxShadow: currentTheme.shadow,
      transition: "background 0.3s, color 0.3s",
    },
    rightSidebar: {
      position: "absolute" as const,
      top: "92px",
      right: "24px",
      width: "320px",
      maxHeight: "calc(100% - 140px)",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
      pointerEvents: "auto" as const,
      zIndex: 1100,
      transform: showRightSidebar
        ? "translateX(0)"
        : "translateX(calc(100% + 32px))",
      opacity: showRightSidebar ? 1 : 0,
      visibility: showRightSidebar ? ("visible" as const) : ("hidden" as const),
      transition: "all 0.3s ease",
    },
    sidebarCard: {
      background: currentTheme.glass,
      backdropFilter: "blur(20px)",
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "16px",
      padding: "16px",
      boxShadow: currentTheme.shadow,
      transition: "all 0.3s ease",
    },
    statRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px 0",
      borderBottom: `1px dashed ${currentTheme.border}`,
    },

    // AI Chat Styles
    chatPanel: {
      position: "absolute" as const,
      bottom: "80px",
      right: "24px",
      width: "380px",
      height: "500px",
      background: currentTheme.chatBg,
      backdropFilter: "blur(30px)",
      WebkitBackdropFilter: "blur(30px)",
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "16px",
      boxShadow: currentTheme.shadow,
      display: "flex",
      flexDirection: "column" as const,
      pointerEvents: "auto" as const,
      zIndex: 1200,
      transform: isChatOpen
        ? "translateY(0) scale(1)"
        : "translateY(20px) scale(0.95)",
      opacity: isChatOpen ? 1 : 0,
      visibility: isChatOpen ? ("visible" as const) : ("hidden" as const),
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    chatHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px",
      borderBottom: `1px solid ${currentTheme.border}`,
      color: currentTheme.textMain,
      fontWeight: 600,
      fontSize: "14px",
    },
    chatBody: {
      flex: 1,
      overflowY: "auto" as const,
      padding: "16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
    },
    chatInputContainer: {
      padding: "16px",
      borderTop: `1px solid ${currentTheme.border}`,
      display: "flex",
      gap: "8px",
    },
    chatInput: {
      flex: 1,
      background: isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)",
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "20px",
      padding: "10px 16px",
      color: currentTheme.textMain,
      fontSize: "14px",
      outline: "none",
    },
    bubble: (role: "user" | "ai") => ({
      maxWidth: "85%",
      padding: "10px 14px",
      borderRadius: "14px",
      fontSize: "13px",
      lineHeight: "1.5",
      alignSelf: role === "user" ? "flex-end" : "flex-start",
      background:
        role === "user" ? currentTheme.userBubble : currentTheme.aiBubble,
      color: role === "user" ? "#fff" : currentTheme.textMain,
      borderBottomRightRadius: role === "user" ? "4px" : "14px",
      borderBottomLeftRadius: role === "ai" ? "4px" : "14px",
    }),
  };

  return (
    <div style={styles.wrapper}>
      <style>{scrollbarStyles}</style>

      <div
        ref={mapDivRef}
        style={{ width: "100%", height: "100%", transition: "filter 0.5s" }}
      />

      <div ref={uiContainerRef} style={styles.uiLayer}>
        <div style={styles.topBar}>
          <button
            className="floating-ui"
            style={styles.actionButton}
            onClick={() => navigate("/")}
            title="Go Back"
          >
            <ArrowLeft {...iconProps} />
          </button>
          <button
            className="floating-ui"
            style={styles.actionButton}
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          >
            {showLeftSidebar ? (
              <PanelLeftClose {...iconProps} />
            ) : (
              <PanelLeft {...iconProps} />
            )}
          </button>
          <div className="floating-ui" style={styles.locationBadge}>
            <div
              style={{
                width: "6px",
                height: "6px",
                background: "#00FF94",
                borderRadius: "50%",
                marginRight: "12px",
                boxShadow: "0 0 8px #00FF94",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                color: currentTheme.textMain,
                textTransform: "uppercase",
              }}
            >
              {initialTerm || "Exploring View"}
            </span>
          </div>
          <button
            className="floating-ui"
            style={styles.actionButton}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
          </button>
          <button
            className="floating-ui"
            style={styles.actionButton}
            onClick={() => setShowRightSidebar(!showRightSidebar)}
          >
            {showRightSidebar ? (
              <PanelRightClose {...iconProps} />
            ) : (
              <PanelRight {...iconProps} />
            )}
          </button>

          {/* NEW AI CHAT BUTTON */}
          <button
            className="floating-ui"
            style={{
              ...styles.actionButton,
              background: isChatOpen ? currentTheme.border : currentTheme.glass,
            }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            title="Spatial AI Agent"
          >
            <MessageSquare
              {...iconProps}
              color={isChatOpen ? "#00FF94" : currentTheme.iconColor}
            />
          </button>
        </div>

        <div className="floating-ui" style={styles.controlsContainer}>
          <div style={styles.controlsHeader}>Overlay Controls</div>
          <div className="custom-scrollbar" style={styles.scrollableList}>
            {layerConfigs.map((layer) => {
              const isActive = layerVisibility[layer.topic];
              const layerColor = extractColorFromStyle(layer.style);
              return (
                <div
                  key={layer.topic}
                  style={styles.layerRow}
                  onClick={() => toggleLayer(layer.topic)}
                >
                  <div style={styles.layerLabel}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: layerColor,
                        opacity: isActive ? 1 : 0.3,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "13px",
                        color: isActive
                          ? currentTheme.textMain
                          : currentTheme.textMuted,
                      }}
                    >
                      {formatLayerName(layer.topic)}
                    </span>
                  </div>
                  <div
                    style={{
                      ...styles.switchTrack,
                      background: isActive
                        ? currentTheme.switchTrackActive
                        : currentTheme.switchTrackInactive,
                    }}
                  >
                    <div
                      style={{
                        ...styles.switchKnob,
                        left: isActive ? "16px" : "2px",
                        background: isActive
                          ? currentTheme.switchKnobActive
                          : currentTheme.switchKnobInactive,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {clickedCoordinate && (
          <div className="floating-ui" style={styles.hud}>
            LOCATION_LOCK: {clickedCoordinate[1].toFixed(4)} N,{" "}
            {clickedCoordinate[0].toFixed(4)} E
          </div>
        )}

        <div className="floating-ui" style={styles.rightSidebar}>
          {/* ... Right Sidebar Content remains unchanged ... */}
          <div style={styles.sidebarCard}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: currentTheme.textMuted,
                marginBottom: "12px",
              }}
            >
              General Values
            </div>
            <div style={styles.statRow}>
              <span style={{ fontSize: "12px", color: currentTheme.textMuted }}>
                Zoom
              </span>
              <span style={{ fontSize: "12px", color: currentTheme.textMain }}>
                {formatNumber(mapStats.zoom, 2)}
              </span>
            </div>
            <div style={styles.statRow}>
              <span style={{ fontSize: "12px", color: currentTheme.textMuted }}>
                Center
              </span>
              <span style={{ fontSize: "12px", color: currentTheme.textMain }}>
                {formatNumber(centerLonLat[1], 4)} N /{" "}
                {formatNumber(centerLonLat[0], 4)} E
              </span>
            </div>
          </div>
        </div>

        {/* AI CHAT PANEL */}
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#00FF94",
                  borderRadius: "50%",
                  boxShadow: "0 0 8px #00FF94",
                }}
              />
              Spatial Agent
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X {...iconSmallProps} />
            </button>
          </div>

          <div className="custom-scrollbar" style={styles.chatBody}>
            {messages.map((msg, idx) => (
              <div key={idx} style={styles.bubble(msg.role)}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={styles.bubble("ai")}>
                <span style={{ opacity: 0.5 }}>Analyzing zones...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={styles.chatInputContainer}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about this area..."
              style={styles.chatInput}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              style={{
                background: chatInput.trim()
                  ? "#007AFF"
                  : currentTheme.switchTrackInactive,
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: chatInput.trim() ? "pointer" : "default",
                transition: "background 0.2s",
              }}
            >
              <Send size={16} color="#fff" style={{ marginLeft: "-2px" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MapView;
