// Herosection.js
import React from "react";
import "./style/Herosection.css";
import { useNavigate } from "react-router-dom";

const Herosection = () => {
  // Initialize the navigate function
  const navigate = useNavigate();

  // Create a handler for the button click
  const handleGetStartedClick = () => {
    navigate("/signup"); // Navigate to the signup page
  };

  return (
    // Changed from <header> to <section> for better semantic structure
    <section className="hero">
      <p className="tagline">AI-Powered Women’s Safety</p>
      <h1>
        Your Personal <span>Safety Companion</span>
      </h1>
      <p className="subtitle">
        SafeWalk uses AI to detect distress situations, share live location, and
        alert your trusted contacts instantly. Walk with confidence knowing
        you’re protected 24/7.
      </p>
      <div className="hero-buttons">
        <button className="btn-primary" onClick={handleGetStartedClick}>
          Get Started 
        </button>
        <button className="btn-secondary">It's Free</button>
      </div>

      {/* ============== START: NEW STATS SECTION ============== */}
      <div className="stats">
        <div className="stat-item">
          <h2>98%</h2>
          <p>Detection Accuracy</p>
        </div>
        <div className="stat-item">
          <h2>&lt;3s</h2>
          <p>Response Time</p>
        </div>
        <div className="stat-item">
          <h2>24/7</h2>
          <p>Monitoring</p>
        </div>
        <div className="stat-item">
          <h2>100%</h2>
          <p>Privacy Protected</p>
        </div>
      </div>
      {/* ============== END: NEW STATS SECTION ============== */}
    </section>
  );
};

export default Herosection;