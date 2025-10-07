import React, { useState, useEffect, useRef } from 'react';

// --- STYLES (Self-Contained) ---
// To resolve the file path errors, all necessary styles are now embedded
// directly within this single file, making it self-contained and runnable.
const DashboardStyles = () => (
  <style>{`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 70px); /* Full viewport height minus header */
      background-color: #f0f2f5;
    }

    .map-area {
      flex-grow: 1; /* The map takes up all available space */
      background-color: #e0e0e0; /* Placeholder color while map loads */
    }

    .controls-area {
      flex-shrink: 0;
      padding: 1.5rem;
      background-color: #ffffff;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      z-index: 10;
    }

    /* --- "Before Trip" View Styles --- */
    .before-trip-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .destination-input {
      width: 100%;
      padding: 0.8rem 1rem;
      font-size: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-sizing: border-box;
    }

    .start-trip-button {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
      font-weight: bold;
      color: white;
      background-color: #6366f1; /* Primary Purple */
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .start-trip-button:hover {
      background-color: #4f46e5;
    }

    /* --- "During Trip" View Styles (TripStatusPanel) --- */
    .trip-status-panel {
      text-align: center;
    }

    .trip-status-panel h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #1f2937;
    }

    .timer {
      margin-bottom: 1.5rem;
    }

    .timer p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .timer span {
      font-size: 2.5rem;
      font-weight: bold;
      color: #111827;
    }

    .trip-actions {
      display: flex;
      gap: 1rem;
    }

    .share-trip-button,
    .end-trip-button {
      flex: 1;
      padding: 0.8rem;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s, color 0.3s;
    }

    .share-trip-button {
      background-color: #e0e7ff;
      color: #4f46e5;
      border: 1px solid #c7d2fe;
    }

    .end-trip-button {
      background-color: #ef4444; /* Red */
      color: white;
      border: none;
    }

    .end-trip-button:hover {
      background-color: #dc2626;
    }
  `}</style>
);


// --- SUB-COMPONENTS (Self-Contained) ---

// This function dynamically loads the Google Maps script
const loadGoogleMapsScript = (apiKey, callback) => {
  if (window.google && window.google.maps) {
    callback();
    return;
  }
  const existingScript = document.getElementById('googleMapsScript');
  if (existingScript) {
    existingScript.addEventListener('load', callback);
    return;
  }
  const script = document.createElement('script');
  script.id = 'googleMapsScript';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
  script.async = true;
  script.defer = true;
  script.onload = () => callback();
  document.head.appendChild(script);
};

const MapView = ({ isTripActive }) => {
  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const [isMapReady, setMapReady] = useState(false);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is missing.");
      return;
    }
    loadGoogleMapsScript(apiKey, () => setMapReady(true));
  }, []);

  useEffect(() => {
    if (isMapReady && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo(pos);
            if(markerInstanceRef.current) {
                markerInstanceRef.current.setPosition(pos);
            }
          }
        },
        () => console.error("Error getting location.")
      );
    }
  }, [isMapReady, isTripActive]);

  useEffect(() => {
    if (isMapReady && mapDivRef.current && !mapInstanceRef.current) {
      const initialCenter = { lat: 26.7606, lng: 83.3732 }; // Default center
      mapInstanceRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: initialCenter,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      });
      markerInstanceRef.current = new window.google.maps.Marker({
        position: initialCenter,
        map: mapInstanceRef.current,
      });
    }
  }, [isMapReady]);

  return isMapReady ? 
    <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} /> : 
    <p>Loading Map...</p>;
};

const TripStatusPanel = ({ tripDetails, onEndTrip }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date() - tripDetails.startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [tripDetails]);

  const formatTime = (totalSeconds) => {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };
  
  const handleShareTrip = () => {
    const shareableLink = `https://yoursite.com/track/${tripDetails.id}`;
    navigator.clipboard.writeText(shareableLink);
    alert(`Sharable link copied to clipboard:\n${shareableLink}`);
  };

  return (
    <div className="trip-status-panel">
      <h3>Trip in Progress...</h3>
      <div className="timer">
        <p>Elapsed Time</p>
        <span>{formatTime(elapsedTime)}</span>
      </div>
      <div className="trip-actions">
        <button className="share-trip-button" onClick={handleShareTrip}>Share Trip</button>
        <button className="end-trip-button" onClick={onEndTrip}>End Trip</button>
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD COMPONENT ---

const Dashboard = () => {
  const [isTripActive, setIsTripActive] = useState(false);
  const [tripDetails, setTripDetails] = useState(null);

  const handleStartTrip = () => {
    console.log("Starting a new trip...");
    const newTrip = {
      id: `trip_${new Date().getTime()}`,
      startTime: new Date(),
    };
    setTripDetails(newTrip);
    setIsTripActive(true);
    alert("Your SafeWalk trip has started. Your location is now being monitored.");
  };

  const handleEndTrip = () => {
    if (tripDetails) {
      console.log("Ending trip:", tripDetails.id);
    }
    setIsTripActive(false);
    setTripDetails(null);
    alert("Your trip has safely ended.");
  };

  return (
    <>
      <DashboardStyles />
      <div className="dashboard-container">
        <div className="map-area">
          <MapView isTripActive={isTripActive} />
        </div>
        <div className="controls-area">
          {isTripActive ? (
            <TripStatusPanel tripDetails={tripDetails} onEndTrip={handleEndTrip} />
          ) : (
            <div className="before-trip-controls">
              <input 
                type="text" 
                placeholder="Enter optional destination..." 
                className="destination-input"
              />
              <button className="start-trip-button" onClick={handleStartTrip}>
                Start SafeWalk Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;

