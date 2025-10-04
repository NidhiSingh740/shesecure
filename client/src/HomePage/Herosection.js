
// Herosection
import React from "react";
import "./style/Herosection.css";   // ✅ relative path to CSS
import { useNavigate } from "react-router-dom";
const Herosection = () => {
  // Initialize the navigate function
  const navigate = useNavigate();

  // Create a handler for the button click
  const handleGetStartedClick = () => {
    navigate('/signup'); // Navigate to the signup page
  };

  return (
    <>
    
      <header className="hero">
        <p className="tagline">AI-Powered Women’s Safety</p>
        <h1>Your Personal <span>Safety Companion</span></h1>
        <p className="subtitle">
          SafeWalk uses AI to detect distress situations, share live location,
          and alert your trusted contacts instantly. Walk with confidence knowing
          you’re protected 24/7.
        </p>
        <div className="hero-buttons">
          {/* Add the onClick event to the button */}
          <button className="btn-primary" onClick={handleGetStartedClick}>
            Get Started Free
          </button>
          <button className="btn-secondary">Watch Demo</button>
        </div>
      </header>
    </>
  );
};

export default Herosection;

