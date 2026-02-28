'use client';

interface ImageBlockProps {
  caption: string;
  imageAlt: string;
}

const portfolioBlocks: ImageBlockProps[] = [
  { caption: "MULTIMODAL SEARCH WITH THE ABILITY TO GIVE FOLLOW-UP QUERIES", imageAlt: "Multimodal search mockup" },
  { caption: "CLOSER LOOK AT QUERY ARCHITECTURE", imageAlt: "Query architecture mockup" },
  { caption: "IMPROVE NAVIGATION AND USABILITY WITH A PERSISTENT SEARCH BAR.", imageAlt: "Persistent search bar mockup" },
  { caption: "REDESIGNED NOTIFICATIONS TO BE MORE COMMUNICATIVE AND SYSTEMATIC ACROSS DOMAINS.", imageAlt: "Redesigned notifications mockups" },
  { caption: "DESIGNED A BETTER WAY FOR PEOPLE TO VIEW THEIR PREFERENCES AND PURCHASE DETAILS.", imageAlt: "Preferences and purchase mockups" },
  { caption: "EXPANDABLE CARDS THAT CAN BE COLLAPSED FOR A MORE COMPACT VIEW.", imageAlt: "Expandable cards mockup" },
  { caption: "LED DESIGNS FOR AN EXPERIMENTAL FEATURE, MEET UP, WHERE USERS CAN FIND RESTAURANTS...", imageAlt: "Meet up feature mockups" },
  { caption: "PROTOTYPED INTELLIGENT RESTAURANT SUGGESTIONS BASED ON USER PREFERENCE AND ORDER HISTORY.", imageAlt: "Restaurant suggestions mockup" },
];

export default function ProjectPage() {
  return (
    <>
      <div className="container">
        {/* Top Navigation */}
        <header className="header">
          <div className="headerLeft">Joseph Zhang</div>
          <div className="headerCenter">
            <span>Interaction Designer</span>
            <span>New York, NY</span>
          </div>
          <div className="headerRight">
            <button className="closeButton" aria-label="Close project">✕</button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero">
          <div className="heroLogo">
            {/* SVG or Image placeholder for the Brain Technologies logo */}
            <div className="logoCircle"></div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="mainContent">
          <div className="layoutGrid">
            
            {/* Left Sidebar */}
            <aside className="sidebar">
              <h1 className="projectTitle">Brain Technologies</h1>
              <p className="projectSubtitle">MULTIMODAL INTERACTION</p>
            </aside>

            {/* Right Content */}
            <div className="content">
              {/* Project Description */}
              <div className="descriptionBlock">
                <p className="descriptionText">
                  For 2 years, I prototyped new ways to engage with computer interfaces, 
                  mostly working with voice and AI. Brain was one of the first companies 
                  to explore the idea of multimodal, generative interfaces. My time working 
                  with the team has shaped many of the principles I design with now. 
                  Most of my work stayed in R&D but pieces of it have shipped and are now in the app store.
                </p>
                
                <div className="metaGrid">
                  <div className="metaItem">
                    <h4>ROLE</h4>
                    <p>Design Consultant</p>
                  </div>
                  <div className="metaItem">
                    <h4>COLLABORATORS</h4>
                    <p>Jerry Yue (CEO)<br/>Gleb Kuznetsov</p>
                  </div>
                  <div className="metaItem">
                    <h4>DURATION</h4>
                    <p>2020-2021</p>
                  </div>
                  <div className="metaItem">
                    <h4>TOOLS</h4>
                    <p>Figma<br/>Origami Studio</p>
                  </div>
                </div>

                <div className="actionLinks">
                  <a href="#" className="linkButton">MAIN WEBSITE <span className="arrow">›</span></a>
                  <a href="#" className="linkButton">NATURAL AI APP <span className="arrow">›</span></a>
                </div>
              </div>

              {/* Image Blocks */}
              <div className="imageGallery">
                {portfolioBlocks.map((block, index) => (
                  <div key={index} className="imageBlock">
                    <div className="imagePlaceholder">
                       {/* In a real scenario, use next/image here */}
                       <span className="placeholderText">Image: {block.imageAlt}</span>
                    </div>
                    <p className="caption">{block.caption}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Embedded Vanilla CSS */}
      <style>{`
        /* Base container */
        .container {
          min-height: 100vh;
          background-color: #111111;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #111111;
          font-size: 0.85rem;
          border-bottom: 1px solid #333;
        }

        .headerCenter {
          display: flex;
          gap: 2rem;
          color: #aaaaaa;
        }

        .closeButton {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 1.2rem;
          cursor: pointer;
        }

        /* Hero Section */
        .hero {
          background-color: #ffffff;
          height: 50vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .logoCircle {
          width: 150px;
          height: 150px;
          border: 15px solid #111111;
          border-radius: 50%;
          position: relative;
        }

        .logoCircle::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -40px;
          width: 25px;
          height: 25px;
          background-color: #111111;
          border-radius: 50%;
          transform: translateY(-50%);
        }

        /* Layout Grid */
        .mainContent {
          padding: 4rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .layoutGrid {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 4rem;
        }

        /* Sidebar */
        .sidebar {
          position: sticky;
          top: 2rem;
        }

        .projectTitle {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 0.25rem 0;
        }

        .projectSubtitle {
          font-size: 0.75rem;
          color: #888888;
          letter-spacing: 0.05em;
          margin: 0;
        }

        /* Content Area */
        .descriptionBlock {
          margin-bottom: 4rem;
        }

        .descriptionText {
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 900px;
          margin-bottom: 3rem;
          color: #cccccc;
        }

        .metaGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
          font-size: 0.85rem;
        }

        .metaItem h4 {
          font-size: 0.7rem;
          color: #888888;
          letter-spacing: 0.05em;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
        }

        .metaItem p {
          margin: 0;
          line-height: 1.4;
          color: #ffffff;
        }

        /* Action Links */
        .actionLinks {
          display: flex;
          gap: 1px;
          background-color: #333;
        }

        .linkButton {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background-color: #1a1a1a;
          color: #ffffff;
          text-decoration: none;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          transition: background-color 0.2s ease;
        }

        .linkButton:hover {
          background-color: #222222;
        }

        .arrow {
          font-size: 1.2rem;
          color: #888888;
        }

        /* Image Gallery */
        .imageGallery {
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .imageBlock {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .imagePlaceholder {
          background-color: #f5f5f5; /* Light grey to represent the white bg in the images */
          width: 100%;
          aspect-ratio: 16 / 9;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #999;
        }

        .caption {
          font-size: 0.75rem;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .layoutGrid {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            position: static;
            margin-bottom: 2rem;
          }
          
          .metaGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .headerCenter {
            display: none; /* Hide on mobile to save space */
          }

          .metaGrid {
            grid-template-columns: 1fr;
          }
          
          .actionLinks {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}