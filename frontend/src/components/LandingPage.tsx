import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---
interface LandingPageProps {
  onSearchSuccess: (addressData: any, searchTerm: string) => void;
}

// Bounding box for San Diego County, CA (matches the map view's search lock).
// Nominatim viewbox format: left,top,right,bottom = minLon,maxLat,maxLon,minLat
const SAN_DIEGO_VIEWBOX = '-117.6,33.51,-116.08,32.53';

const LandingPage: React.FC<LandingPageProps> = ({ onSearchSuccess }) => {
  const [term, setTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Autocomplete suggestion state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // --- GSAP INTRO ANIMATION ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // 1. Background Glow expands
      tl.fromTo(glowRef.current,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 0.6, duration: 2, ease: 'power3.out' }
      )
        // 2. Title floats up
        .from(titleRef.current, {
          y: 40,
          opacity: 0,
          duration: 1.5,
          filter: 'blur(10px)', // Cinematic blur in
        }, '-=1.5')
        // 3. Search Bar expands width-wise
        .from(formRef.current, {
          scaleX: 0.8,
          y: 20,
          opacity: 0,
          duration: 1.2,
        }, '-=1.2');

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- INTERACTION ANIMATIONS ---
  // Animate button in/out based on text content
  useLayoutEffect(() => {
    if (term.length > 0) {
      gsap.to(buttonRef.current, { width: 'auto', opacity: 1, paddingLeft: 20, paddingRight: 20, duration: 0.4, ease: 'power2.out' });
    } else {
      gsap.to(buttonRef.current, { width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0, duration: 0.3, ease: 'power2.in' });
    }
  }, [term]);

  // Animate Glow on Focus
  useLayoutEffect(() => {
    gsap.to(glowRef.current, {
      opacity: isFocused ? 0.8 : 0.4,
      scale: isFocused ? 1.1 : 1,
      duration: 0.5
    });
  }, [isFocused]);

  // --- LOGIC ---
  const isCompleteAddress = (address: any) => {
    if (!address) return false;
    const hasStreet = Boolean(address.house_number && address.road);
    const hasCity = Boolean(address.city || address.town || address.village);
    const hasState = Boolean(address.state || address.state_code);
    return hasStreet && hasCity && hasState;
  };

  const isSanDiegoAddress = (address: any) => {
    if (!address) return false;
    const city = (address.city || address.town || address.village || '').toLowerCase();
    const county = (address.county || '').toLowerCase();
    return city.includes('san diego') || city.includes('san deigo') || county.includes('san diego');
  };

  // --- ADDRESS AUTOCOMPLETE (Nominatim / OpenStreetMap only, no Google) ---
  // Debounced, and hard-locked to San Diego via both the request viewbox and
  // a client-side re-check of the returned address fields.
  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setIsSuggestLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSuggestLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '6',
        countrycodes: 'us',
        viewbox: SAN_DIEGO_VIEWBOX,
        bounded: '1',
      });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { 'Accept-Language': 'en' }, signal: controller.signal },
      );
      const json = await res.json();

      const valid = Array.isArray(json)
        ? json.filter((item) => isCompleteAddress(item.address) && isSanDiegoAddress(item.address))
        : [];

      setSuggestions(valid);
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        console.error('Suggestion fetch failed', err);
        setSuggestions([]);
      }
    } finally {
      setIsSuggestLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!term) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(term);
    }, 450); // debounce, also keeps us under Nominatim's ~1 req/sec usage policy

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchAreaRef.current && !searchAreaRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Shared cinematic exit + navigation, used by both manual submit and
  // picking a suggestion from the dropdown.
  const proceedWithResult = (validResults: any[], searchTerm: string) => {
    setShowSuggestions(false);
    setIsLoading(false);

    const tl = gsap.timeline();
    tl.to(titleRef.current, { opacity: 0, y: -20, duration: 0.5 })
      .to(formRef.current, { scale: 0.9, opacity: 0, blur: 10, duration: 0.4 }, '-=0.3')
      .to(glowRef.current, { scale: 3, opacity: 0, duration: 0.8 }, '-=0.4');

    // Artificial delay for smooth transition feel
    setTimeout(() => {
      onSearchSuccess(validResults, searchTerm);
      navigate('/open');
    }, 800);
  };

  const handleSelectSuggestion = (item: any) => {
    const label = item.display_name.split(',')[0];
    setTerm(label);
    proceedWithResult([item], label);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;
    setErrorMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const params = new URLSearchParams({
        q: term,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'us',
        viewbox: SAN_DIEGO_VIEWBOX,
        bounded: '1',
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      const json = await response.json();

      const validResults = Array.isArray(json)
        ? json.filter((item) => isCompleteAddress(item.address) && isSanDiegoAddress(item.address))
        : [];

      if (validResults.length === 0) {
        setIsLoading(false);
        setErrorMessage('San Diego address only. Please try a different query.');
        gsap.to([containerRef.current, titleRef.current, formRef.current], { opacity: 1, y: 0, scale: 1, blur: 0, duration: 0.5 });
        return;
      }

      proceedWithResult(validResults, term);

    } catch (error) {
      console.error("Search failed", error);
      setIsLoading(false);
      setErrorMessage('Search failed. Please try again.');
      // Reset Animation if failed
      gsap.to([containerRef.current, titleRef.current, formRef.current], { opacity: 1, y: 0, scale: 1, blur: 0, duration: 0.5 });
    }
  };

  // --- STYLES ---
  const styles = {
    wrapper: {
      height: '100vh',
      width: '100vw',
      backgroundColor: '#030303', // Deepest black
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    // The Ambient Glow Behind
    glow: {
      position: 'absolute' as const,
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
      borderRadius: '50%',
      pointerEvents: 'none' as const,
      zIndex: 0,
      transform: 'translate(-50%, -50%)',
    },
    contentZ: {
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      width: '100%',
    },
    title: {
      fontSize: 'clamp(3rem, 6vw, 5rem)',
      fontWeight: 800,
      margin: '0 0 40px 0',
      textAlign: 'center' as const,
      letterSpacing: '-0.04em',
      // Gradient Text Effect
      background: 'linear-gradient(to bottom, #ffffff 0%, #888888 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    searchArea: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '600px',
    },
    form: {
      position: 'relative' as const,
      width: '100%',
      padding: '0 24px',
    },
    glassContainer: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.03)', // Extremely subtle fill
      backdropFilter: 'blur(20px)', // Heavy blur
      WebkitBackdropFilter: 'blur(20px)',
      border: errorMessage ? '1px solid rgba(255, 80, 80, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px', // Smooth pill shape
      padding: '8px',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      boxShadow: isFocused
        ? '0 0 40px rgba(255, 255, 255, 0.05), inset 0 0 0 1px rgba(255,255,255,0.1)'
        : '0 10px 40px rgba(0,0,0,0.5)',
    },
    searchIcon: {
      marginLeft: '16px',
      color: '#555',
      transition: 'color 0.3s',
    },
    input: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#fff',
      fontSize: '1.1rem',
      fontWeight: 400,
      padding: '16px',
      letterSpacing: '-0.02em',
      caretColor: '#fff', // White cursor
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      color: '#000',
      border: 'none',
      borderRadius: '16px',
      height: '48px',
      fontSize: '0.9rem',
      fontWeight: 600,
      cursor: 'pointer',
      overflow: 'hidden', // Hide content when width is 0
      whiteSpace: 'nowrap' as const,
    },
    loader: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(0,0,0,0.1)',
      borderTop: '2px solid #000',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    alert: {
      marginTop: '14px',
      color: '#ff5a5a',
      fontSize: '0.95rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      textAlign: 'center' as const,
    },
    texting: {
      fontSize: 'clamp(1rem, 6vw, 1rem)',
      fontWeight: 500,
      margin: '80px 240px 20px 240px',
      textAlign: 'center' as const,
      letterSpacing: '-0.04em',
      // Gradient Text Effect
      background: 'linear-gradient(to bottom, #ffffff 0%, #888888 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },

    // Autocomplete dropdown
    suggestionsPanel: {
      position: 'absolute' as const,
      top: 'calc(100% + 10px)',
      left: '24px',
      right: '24px',
      background: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      overflow: 'hidden',
      zIndex: 20,
      opacity: showSuggestions ? 1 : 0,
      visibility: showSuggestions ? ('visible' as const) : ('hidden' as const),
      transform: showSuggestions ? 'translateY(0)' : 'translateY(-6px)',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    suggestionsList: {
      maxHeight: '280px',
      overflowY: 'auto' as const,
      padding: '6px',
    },
    suggestionRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px 12px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'background 0.15s ease',
    },
    suggestionText: {
      fontSize: '0.85rem',
      color: '#eee',
      lineHeight: 1.45,
    },
    suggestionEmpty: {
      padding: '18px 16px',
      fontSize: '0.85rem',
      color: '#777',
      textAlign: 'center' as const,
      lineHeight: 1.5,
    },
    suggestionFooter: {
      padding: '10px 14px',
      fontSize: '0.65rem',
      color: '#555',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    },
  };

  return (
    <div ref={containerRef} style={styles.wrapper}>

      {/* CSS Animation for loader */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ::selection { background: rgba(255,255,255,0.2); color: white; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
        @media (max-width: 768px) {
          .description-text { display: none; }
        }
      `}</style>

      {/* Ambient Background Aura */}
      <div ref={glowRef} style={styles.glow} />

      <div style={styles.contentZ}>
        {/* Title */}
        <h1 ref={titleRef} style={styles.title}>
          Explore the San Diego.
        </h1>

        {/* Search Component */}
        <div ref={searchAreaRef} style={styles.searchArea}>
          <form ref={formRef} onSubmit={handleSearch} style={styles.form}>
            <div style={styles.glassContainer}>

              {/* Search Icon */}
              <div style={{ ...styles.searchIcon, color: isFocused ? '#fff' : '#555' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>

              {/* Input Field */}
              <input
                ref={inputRef}
                type="text"
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                onFocus={() => {
                  setIsFocused(true);
                  if (term) setShowSuggestions(true);
                }}
                onBlur={() => setIsFocused(false)}
                placeholder="Search a San Diego address, city, or place..."
                style={styles.input}
                disabled={isLoading}
                autoFocus
              />

              {/* Animated Button */}
              <button
                ref={buttonRef}
                type="submit"
                style={styles.button}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={styles.loader} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                )}
              </button>
            </div>
            {errorMessage && <div style={styles.alert}>{errorMessage}</div>}
          </form>

          {/* Address Autocomplete Dropdown — Nominatim/OpenStreetMap only, San Diego locked */}
          {showSuggestions && term.trim().length > 0 && (
            <div style={styles.suggestionsPanel}>
              <div className="custom-scrollbar" style={styles.suggestionsList}>
                {term.trim().length < 3 && (
                  <div style={styles.suggestionEmpty}>Keep typing to search...</div>
                )}

                {term.trim().length >= 3 && isSuggestLoading && suggestions.length === 0 && (
                  <div style={styles.suggestionEmpty}>Searching San Diego...</div>
                )}

                {term.trim().length >= 3 && !isSuggestLoading && suggestions.length === 0 && (
                  <div style={styles.suggestionEmpty}>
                    No matches found in San Diego.
                    <br />
                    This search is limited to San Diego addresses only.
                  </div>
                )}

                {suggestions.map((item) => (
                  <div
                    key={item.place_id}
                    style={styles.suggestionRow}
                    onMouseDown={() => handleSelectSuggestion(item)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#777"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginTop: '2px', flexShrink: 0 }}
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style={styles.suggestionText}>{item.display_name}</span>
                  </div>
                ))}
              </div>
              <div style={styles.suggestionFooter}>Powered by OpenStreetMap · San Diego only</div>
            </div>
          )}
        </div>

        <h3 ref={titleRef} style={styles.texting} className="description-text">
          MapLayer is a lightweight and powerful geospatial visualization platform designed to make mapping simple and intuitive. It allows users to load, explore, and interact with GeoJSON datasets directly in the browser using a modern React interface. With customizable layers, markers, and seamless OpenLayers integration, MapLayer transforms raw geographic data into meaningful insights. Built for developers, researchers, and analysts, it delivers speed, flexibility, and a clean mapping experience.
        </h3>
      </div>
    </div>
  );
};

export default LandingPage;