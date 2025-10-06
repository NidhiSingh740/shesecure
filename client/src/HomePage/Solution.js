import React from 'react';

// To keep the code self-contained, the styles are embedded below.
const SolutionStyles = () => (
  <style>
    {`
      /* --- Solution Section Styles --- */
      .solution-section {
        padding: 5rem 3rem;
        background: linear-gradient(135deg, #f6f2f4ff, #f1ebf9ff);
        text-align: center;
      }

      .solution-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .solution-section h2 {
        font-size: 2.5rem;
        font-weight: 700;
          color: #b8369a;

        margin-bottom: 1rem;
      }

      .solution-section .solution-subtitle {
        font-size: 1.1rem;
        color: #666;
        max-width: 700px;
        margin: 0 auto 3rem auto;
        line-height: 1.6;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }

      .feature-card {
        background: #ffffff;
        padding: 0.1rem 0.1rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .feature-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      }

      .feature-card h3 {
        font-size: 1.4rem;
        font-weight: 600;
          color: #b8369a;

        margin: 1rem 0 0.5rem 0;
      }

      .feature-card p {
        color: #555;
        line-height: 1.7;
      }

      @media (max-width: 992px) {
        .features-grid {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .solution-section {
          padding: 4rem 2rem;
        }
      }

      @media (max-width: 576px) {
        .solution-section {
          padding: 3rem 1.5rem;
        }
        .solution-section h2 {
          font-size: 2rem;
        }
      }
    `}
  </style>
);

// --- ICONS --- //

// AI Monitoring - Brain
const BrainIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
    <path d="M9.5 13.5c-1.1 0-2 .9-2 2s.9 2 2 2 
             2-.9 2-2-.9-2-2-2zm5 0c-1.1 0-2 .9-2 2s.9 
             2 2 2 2-.9 2-2-.9-2-2-2zM12 2C6.48 2 2 
             6.48 2 12s4.48 10 10 10 10-4.48 
             10-10S17.52 2 12 2z" fill="#b8369a"/>
  </svg>
);

// Location Sharing - Map Pin
const LocationIcon = () => (
  <svg width="64" height="64" fill="#b8369a" viewBox="0 0 24 24">
    <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 
             13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 
             9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 
             6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 
             11.5 12 11.5z"/>
  </svg>
);

// SOS Alerts - Megaphone
const AlertIcon = () => (
  <svg width="64" height="64" fill="#b8369a" viewBox="0 0 24 24">
    <path d="M3 10v4h2l5 5V5L5 10H3zm13-3h4v10h-4l-5 
             3V4l5 3z"/>
  </svg>
);

// Safe-Check - Clock/Timer
const TimerIcon = () => (
  <svg width="64" height="64" fill="#b8369a" viewBox="0 0 24 24">
    <path d="M15.07 1.72L13.65 3.14A9.969 9.969 0 
             0 0 12 3c-5.52 0-10 4.48-10 
             10s4.48 10 10 10 10-4.48 
             10-10c0-2.21-.72-4.25-1.93-5.9l1.42-1.42zM12 
             20c-4.41 0-8-3.59-8-8s3.59-8 
             8-8 8 3.59 8 8-3.59 8-8 
             8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
  </svg>
);

// Incident Reporting - Flag
const FlagIcon = () => (
  <svg width="64" height="64" fill="#b8369a" viewBox="0 0 24 24">
    <path d="M14 6l-1-2H5v16h2v-6h6l1 2h7V6h-7z"/>
  </svg>
);

// Route Safety - Route Path
const RouteIcon = () => (
  <svg width="64" height="64" fill="#b8369a" viewBox="0 0 24 24">
    <path d="M19 9.5c1.38 0 2.5-1.12 2.5-2.5S20.38 
             4.5 19 4.5 16.5 5.62 16.5 
             7s1.12 2.5 2.5 2.5zM5 
             20.5c1.38 0 2.5-1.12 
             2.5-2.5S6.38 15.5 5 
             15.5 2.5 16.62 2.5 
             18 3.62 20.5 5 
             20.5zm14-11c-2.33 0-7 
             1.17-7 3.5v5h-2v-5c0-2.33 
             4.67-3.5 7-3.5z"/>
  </svg>
);

const Solution = () => {
  return (
    <>
      <SolutionStyles />
      <section className="solution-section">
        <div className="solution-container">
          <h2>Our AI-Powered Solution</h2>
          <p className="solution-subtitle">
           SafeWalk bridges the gap in women’s safety by using AI-powered detection, real-time monitoring, and automated emergency responses. Unlike traditional safety apps, SafeWalk works proactively—detecting risks, alerting trusted contacts, and ensuring protection without manual intervention.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <BrainIcon />
              <h3>AI-Powered Smart Trip Monitoring</h3>
              <p>AI tracks journeys in real-time, detecting unusual delays and alerting trusted contacts instantly.</p>
            </div>

            <div className="feature-card">
              <LocationIcon />
              <h3>Real-Time Location Sharing</h3>
              <p>Share live GPS updates securely with family and friends throughout your trip.</p>
            </div>

            <div className="feature-card">
              <AlertIcon />
              <h3>One-Tap & Voice SOS Alerts</h3>
              <p>Trigger instant SOS alerts with location via button or voice command.</p>
            </div>

            <div className="feature-card">
              <TimerIcon />
              <h3>Smart Safe-Check</h3>
              <p>Automatic SOS triggers if the user misses scheduled safety check-ins.</p>
            </div>

            <div className="feature-card">
              <FlagIcon />
              <h3>Incident Reporting</h3>
              <p>Users can report unsafe areas, helping build community safety maps.</p>
            </div>

            <div className="feature-card">
              <RouteIcon />
              <h3>Route Safety Scoring with AI Rules</h3>
              <p>AI evaluates and scores routes to guide users toward safer paths.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Solution;
