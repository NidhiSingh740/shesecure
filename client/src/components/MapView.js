import React, { useState, useEffect, useRef } from 'react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// A default center for the map before we get the user's location
const defaultCenter = {
  lat: 26.7606, // Example: Gorakhpur
  lng: 83.3732
};

// This function dynamically loads the Google Maps script into the document
const loadGoogleMapsScript = (apiKey, callback) => {
  // Check if the script is already loaded or being loaded
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
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps`;
  script.async = true;
  script.defer = true;
  script.addEventListener('load', callback);
  document.head.appendChild(script);
};

const MapView = ({ isTripActive }) => {
  // useRef to hold the div element where the map will be rendered
  const mapDivRef = useRef(null);
  // useRef to hold the map instance to avoid re-renders
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const [isMapReady, setMapReady] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);

  // Effect 1: Load the Google Maps script once
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Fatal Error: Google Maps API key is missing from .env file.");
      return;
    }
    loadGoogleMapsScript(apiKey, () => {
      setMapReady(true);
    });
  }, []); // Empty dependency array ensures this runs only once

  // Effect 2: Get and update the user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      // In a real app with live tracking, you would use navigator.geolocation.watchPosition
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
        },
        () => {
          console.error("Error getting user location. Defaulting to center.");
          setCurrentPosition(defaultCenter);
        }
      );
    }
  }, [isTripActive]); // This effect re-runs when the trip starts or ends

  // Effect 3: Initialize the map and update the marker when position changes
  useEffect(() => {
    // Do nothing until the script is ready and the div is available
    if (!isMapReady || !mapDivRef.current) {
      return;
    }
    
    // If the map instance doesn't exist, create it
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: currentPosition,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
      });
    } else {
      // If it exists, just pan to the new center
      mapInstanceRef.current.panTo(currentPosition);
    }
    
    // If the marker doesn't exist, create it
    if (!markerInstanceRef.current) {
      markerInstanceRef.current = new window.google.maps.Marker({
        position: currentPosition,
        map: mapInstanceRef.current,
      });
    } else {
      // If it exists, just update its position
      markerInstanceRef.current.setPosition(currentPosition);
    }
  }, [isMapReady, currentPosition]); // This effect re-runs when the map is ready or the position changes

  return isMapReady ? (
    // This div is where the Google Map will be rendered
    <div ref={mapDivRef} style={containerStyle} />
  ) : (
    <div style={{ padding: '1rem', textAlign: 'center' }}>Loading Map...</div>
  );
};

export default MapView;

