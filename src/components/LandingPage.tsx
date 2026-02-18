import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---
interface LandingPageProps {
  onSearchSuccess: (addressData: any, searchTerm: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSearchSuccess }) => {
  const [term, setTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;

    setIsLoading(true);

    // Cinematic Exit Animation
    const tl = gsap.timeline();
    tl.to(titleRef.current, { opacity: 0, y: -20, duration: 0.5 })
      .to(formRef.current, { scale: 0.9, opacity: 0, blur: 10, duration: 0.4 }, '-=0.3')
      .to(glowRef.current, { scale: 3, opacity: 0, duration: 0.8 }, '-=0.4');

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search
?q=${term}
&format=json
&addressdetails=1
&limit=5
&countrycodes=us
&viewbox=-124.48,42.01,-114.13,32.53
&bounded=1
`);
      const json = await response.json();

      // Artificial delay for smooth transition feel
      setTimeout(() => {
        onSearchSuccess(json, term);
        navigate('/open');
      }, 800);

    } catch (error) {
      console.error("Search failed", error);
      setIsLoading(false);
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
    form: {
      position: 'relative' as const,
      width: '100%',
      maxWidth: '600px',
      padding: '0 24px',
    },
    glassContainer: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.03)', // Extremely subtle fill
      backdropFilter: 'blur(20px)', // Heavy blur
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
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
  };

  return (
    <div ref={containerRef} style={styles.wrapper}>

      {/* CSS Animation for loader */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        ::selection { background: rgba(255,255,255,0.2); color: white; }
      `}</style>

      {/* Ambient Background Aura */}
      <div ref={glowRef} style={styles.glow} />

      <div style={styles.contentZ}>
        {/* Title */}
        <h1 ref={titleRef} style={styles.title}>
          Explore the San Diego.
        </h1>

        {/* Search Component */}
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
              onChange={(e) => setTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search address, city, or place..."
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
        </form>
        <h3 ref={titleRef} style={styles.texting}>
          MapLayer is a lightweight and powerful geospatial visualization platform designed to make mapping simple and intuitive. It allows users to load, explore, and interact with GeoJSON datasets directly in the browser using a modern React interface. With customizable layers, markers, and seamless OpenLayers integration, MapLayer transforms raw geographic data into meaningful insights. Built for developers, researchers, and analysts, it delivers speed, flexibility, and a clean mapping experience.
        </h3>
      </div>
    </div>
  );
};

export default LandingPage;