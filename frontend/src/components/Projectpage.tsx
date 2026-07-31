import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const ProjectShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
//   const cursorRef = useRef<HTMLDivElement>(null);

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Scroll Listener for Navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- GSAP ANIMATIONS ---
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. Initial Load Sequence
      tl.from('.hero-word', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.05,
        ease: 'power4.out'
      })
      .from('.hero-desc', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: 'power2.out'
      }, '-=0.8')
      .from('.nav-item', {
        y: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=1');

      // 2. Floating 3D Elements
      gsap.to('.visual-card', {
        y: '15px',
        rotateX: 4,
        rotateY: 4,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        stagger: { each: 0.5, from: "end" }
      });

      // 3. Scroll Triggered Reveals
      const sections = gsap.utils.toArray('.reveal-section');
      sections.forEach((section: any) => {
        gsap.from(section.children, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          },
          y: 60,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'expo.out'
        });
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleLaunch = () => {
    const tl = gsap.timeline();
    tl.to(containerRef.current, { scale: 0.98, opacity: 0, filter: 'blur(20px)', duration: 0.8, ease: 'power2.in' });
    setTimeout(() => navigate('/site'), 800);
  };

  // --- STYLES (Using CSS Variables for Theme Support) ---
  const styles = {
    wrapper: {
      fontFamily: '"Space Grotesk", sans-serif', // Modern Tech Font
      minHeight: '100vh',
      overflowX: 'hidden' as const,
      position: 'relative' as const,
    },
    // NAVBAR
    nav: {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0,
      height: '90px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 5%',
      zIndex: 100,
      transition: 'all 0.4s ease',
      backgroundColor: isScrolled ? 'var(--bg-color)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(20px)' : 'none',
      borderBottom: isScrolled ? '1px solid var(--border-color)' : '1px solid transparent',
    },
    logo: {
      fontSize: '1.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--text-main)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
    },
    logoDot: {
      width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%',
      boxShadow: '0 0 10px var(--accent)'
    },
    navLinks: {
      display: 'flex', gap: '40px', alignItems: 'center',
      '@media (max-width: 768px)': { display: 'none' } 
    },
    link: {
      fontSize: '0.9rem',
      fontWeight: 500,
      color: 'var(--text-muted)',
      cursor: 'pointer',
      transition: 'color 0.3s',
      letterSpacing: '0.02em',
    },
    // HERO
    hero: {
      minHeight: '100vh',
      padding: '140px 5% 80px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '60px',
    },
    heroText: { flex: '1 1 500px' },
    pill: {
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '8px 16px', borderRadius: '100px',
      background: 'rgba(0, 240, 255, 0.05)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600,
      marginBottom: '32px', letterSpacing: '0.05em'
    },
    h1: {
      fontSize: 'clamp(3.5rem, 6vw, 6rem)',
      fontWeight: 700,
      lineHeight: 1.05,
      marginBottom: '32px',
      color: 'var(--text-main)',
      letterSpacing: '-0.03em',
    },
    desc: {
      fontSize: 'clamp(1.1rem, 1.5vw, 1.25rem)',
      color: 'var(--text-muted)',
      lineHeight: 1.6,
      maxWidth: '580px',
      marginBottom: '48px',
      fontFamily: '"Inter", sans-serif',
      fontWeight: 300,
    },
    btnPrimary: {
      padding: '18px 48px',
      background: 'var(--text-main)',
      color: 'var(--bg-color)',
      border: 'none',
      borderRadius: '2px', // Sharper corners for modern look
      fontWeight: 600,
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      letterSpacing: '0.02em',
    },
    btnSecondary: {
        padding: '18px 48px',
        background: 'transparent',
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)',
        borderRadius: '2px',
        fontWeight: 600,
        fontSize: '0.95rem',
        cursor: 'pointer',
        marginLeft: '20px',
        transition: 'background 0.2s',
      },
    // VISUAL
    visualContainer: {
        flex: '1 1 400px',
        height: '600px',
        position: 'relative' as const,
        perspective: '2000px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    layerStack: {
        position: 'relative' as const,
        width: '340px', height: '440px',
        transformStyle: 'preserve-3d' as const,
        transform: 'rotateX(55deg) rotateZ(-35deg) rotateY(5deg)',
    },
    layerCard: (z: number, color: string) => ({
        position: 'absolute' as const,
        inset: 0,
        background: 'var(--card-bg)', // Glass var
        backdropFilter: 'blur(12px)',
        border: `1px solid ${color}`,
        transform: `translateZ(${z}px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 40px -10px ${color}40`,
        borderRadius: '16px',
        color: 'var(--text-main)',
        fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.1em'
    }),

    // SECTION GENERAL
    section: { padding: '160px 5%', borderTop: '1px solid var(--border-color)' },
    sectionLabel: {
        color: 'var(--accent)',
        fontSize: '0.8rem', fontWeight: 600,
        textTransform: 'uppercase' as const, letterSpacing: '0.2em',
        marginBottom: '24px', display: 'block'
    },
    h2: {
        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
        fontWeight: 700, color: 'var(--text-main)',
        marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-0.02em'
    },
    
    // GRID
    grid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px', marginTop: '80px'
    },
    card: {
        padding: '48px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        transition: 'border-color 0.3s',
        cursor: 'default'
    },
    icon: {
        width: '48px', height: '48px', marginBottom: '32px',
        color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)', borderRadius: '8px'
    },
    cardTitle: {
        fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px',
        color: 'var(--text-main)', letterSpacing: '-0.02em'
    },
    cardText: {
        color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1rem',
        fontFamily: '"Inter", sans-serif'
    },
    
    // FOOTER
    footer: {
        padding: '120px 5%',
        background: 'var(--bg-color)',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center' as const
    },
    themeBtn: {
        background: 'transparent', border: '1px solid var(--border-color)',
        color: 'var(--text-main)', width: '40px', height: '40px',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.3s'
    }
  };

  return (
    <div ref={containerRef} style={styles.wrapper}>
      
      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.logo} className="nav-item" onClick={() => window.scrollTo(0,0)}>
           <div style={styles.logoDot}/> MapLayer.
        </div>
        <div style={styles.navLinks} className="nav-item">
            {[].map((item) => (
                <span key={item} style={styles.link} 
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {item}
                </span>
            ))}
            <button style={styles.themeBtn} onClick={toggleTheme}>
                {themeMode === 'dark' ? 
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> 
                    : 
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
            </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header style={styles.hero}>
        <div style={styles.heroText}>

          
          <h1 style={styles.h1}>
            <div style={{overflow:'hidden'}}><div className="hero-word">The Operating System</div></div>
            <div style={{overflow:'hidden'}}><div className="hero-word" style={{color: 'var(--text-muted)'}}>for Modern Cities.</div></div>
          </h1>
          
          <p className="hero-desc" style={styles.desc}>
            MapLayer unifies fragmented urban data into a single, high-performance geospatial decision engine. Visualize zoning, transit, and environmental risks in real-time.
          </p>
          
          <div className="hero-desc">
            <button 
                style={styles.btnPrimary} 
                onClick={handleLaunch}
                onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3 });
                }}
                onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { scale: 1, duration: 0.3 });
                }}
            >
                Launch Platform
            </button>
            {/* <button style={styles.btnSecondary}>Documentation</button> */}
          </div>
        </div>

        {/* 3D VISUALIZATION */}
        <div style={styles.visualContainer}>
            <div style={styles.layerStack}>
                <div className="visual-card" style={styles.layerCard(0, 'var(--border-color)')}>
                    BASEMAP
                </div>
                <div className="visual-card" style={styles.layerCard(80, 'var(--accent)')}>
                    INFRASTRUCTURE
                </div>
                <div className="visual-card" style={styles.layerCard(160, '#7000FF')}>
                    ZONING DATA
                </div>
                <div className="visual-card" style={styles.layerCard(240, 'var(--text-main)')}>
                    ANALYTICS
                </div>
            </div>
        </div>
      </header>

      {/* CHALLENGE SECTION */}
      <section className="reveal-section" style={styles.section}>
        <div style={{maxWidth: '800px'}}>
            <span style={styles.sectionLabel}>01 — The Challenge</span>
            <h2 style={styles.h2}>Data fragmentation <br/>is paralyzing progress.</h2>
            <p style={styles.desc}>
                Cities generate terabytes of spatial data daily. Yet, Planners and Emergency Responders operate in silos, using outdated PDF maps and disjointed portals.
            </p>
        </div>

        <div style={styles.grid}>
             {/* Card 1 */}
            <div style={styles.card} 
                 onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                 onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div style={styles.icon}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <h3 style={styles.cardTitle}>Emergency Latency</h3>
                <p style={styles.cardText}>First responders struggle to access integrated utility and hazard data during critical incidents, costing seconds that matter.</p>
            </div>

            {/* Card 2 */}
            <div style={styles.card}
                 onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                 onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div style={styles.icon}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                </div>
                <h3 style={styles.cardTitle}>Planning Blindspots</h3>
                <p style={styles.cardText}>Zoning, environmental, and transit layers are rarely visualized together, making holistic impact analysis impossible.</p>
            </div>
            
            {/* Card 3 */}
            <div style={styles.card}
                 onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                 onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                 <div style={styles.icon}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </div>
                <h3 style={styles.cardTitle}>Transparency Gaps</h3>
                <p style={styles.cardText}>Citizens lack a clear, real-time window into construction projects, road closures, and city development plans.</p>
            </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="reveal-section" style={styles.section}>
        <div style={{maxWidth: '800px'}}>
             <span style={styles.sectionLabel}>02 — The Solution</span>
             <h2 style={styles.h2}>A unified geospatial <br/>intelligence core.</h2>
        </div>
        
        <div style={styles.grid}>
             {/* Feature 1 */}
             <div style={{paddingTop: '20px'}}>
                <h3 style={{...styles.cardTitle, fontSize: '2rem', color: 'var(--accent)'}}>Modular Layering</h3>
                <p style={styles.cardText}>
                    MapLayer's engine allows users to stack infinite datasets—parcels, sewer lines, fire zones—and toggle them instantly with zero latency.
                </p>
             </div>
             {/* Feature 2 */}
             <div style={{paddingTop: '20px', borderLeft: '1px solid var(--border-color)', paddingLeft: '40px'}}>
                <h3 style={{...styles.cardTitle, fontSize: '2rem', color: '#7000FF'}}>Real-Time Sync</h3>
                <p style={styles.cardText}>
                    Direct integration with San Diego's Open Data portal ensures that the map you see today reflects the reality of the city right now.
                </p>
             </div>
             {/* Feature 3 */}
             <div style={{paddingTop: '20px', borderLeft: '1px solid var(--border-color)', paddingLeft: '40px'}}>
                <h3 style={{...styles.cardTitle, fontSize: '2rem'}}>Interactive HUD</h3>
                <p style={styles.cardText}>
                    A designer-grade UI that floats above the map, providing coordinate locking, layer analysis, and distinct color coding without clutter.
                </p>
             </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="reveal-section" style={styles.footer}>
          <h2 style={{...styles.h2, fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: '40px'}}>
              See the data. <br/> Shape the future.
          </h2>
          <button 
                onClick={handleLaunch}
                style={{
                    padding: '24px 64px',
                    fontSize: '1.1rem',
                    background: 'var(--text-main)',
                    color: 'var(--bg-color)',
                    border: 'none',
                    borderRadius: '2px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.05em'
                }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, {scale: 1.05})}
                onMouseLeave={(e) => gsap.to(e.currentTarget, {scale: 1})}
            >
                LAUNCH PLATFORM
            </button>
            
            <div style={{marginTop: '120px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '40px'}}>
                <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>© 2024 MapLayer.</span>
                <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>San Diego Smart City Initiative</span>
            </div>
      </footer>
    </div>
  );
};

export default ProjectShowcase;