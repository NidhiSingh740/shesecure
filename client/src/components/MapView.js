// src/components//MapView.js

import React, { useState, useEffect, useRef } from 'react';

// --- STYLE & SCRIPT LOADER FUNCTIONS ---
// To resolve the build errors, we will load the Leaflet library directly from a CDN
// instead of using npm imports. This is a robust method that works in any environment.

// Injects the required Leaflet CSS into the document's head
const loadLeafletCSS = () => {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
};

// Injects the Leaflet JavaScript library and calls a function when it's ready
const loadLeafletScript = (callback) => {
  if (window.L) { // Check if Leaflet is already loaded
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
  script.crossOrigin = '';
  script.onload = () => callback();
  document.head.appendChild(script);
};

// --- MAIN MAPVIEW COMPONENT ---
const MapView = ({ isTripActive }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentPosition, setCurrentPosition] = useState({ lat: 26.7606, lng: 83.3732 }); // Default: Gorakhpur

  // Effect 1: Load CSS and the Leaflet script
  useEffect(() => {
    loadLeafletCSS();
    loadLeafletScript(() => {
      setIsMapReady(true);
    });
  }, []);

  // Effect 2: Get user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(newPos);
      },
      () => console.error("Could not get user's location.")
    );
  }, [isTripActive]);

  // Effect 3: Initialize the map and marker, and update them when the position changes.
  useEffect(() => {
    // Only run this if the script is loaded and the container div exists
    if (isMapReady && mapContainerRef.current) {
      const L = window.L; // Leaflet is now available on the window object

      // If the map hasn't been created yet, initialize it.
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([currentPosition.lat, currentPosition.lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstanceRef.current);
        
        // Create a custom icon to avoid issues with default icon paths
        const customIcon = new L.Icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        
        markerInstanceRef.current = L.marker([currentPosition.lat, currentPosition.lng], { icon: customIcon }).addTo(mapInstanceRef.current);

      } else {
        // If the map already exists, just update the view and marker position.
        mapInstanceRef.current.setView([currentPosition.lat, currentPosition.lng]);
        markerInstanceRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
      }
    }
  }, [isMapReady, currentPosition]); // Re-run this effect when map is ready or position changes

  return (
    <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}>
      {!isMapReady && <p style={{ textAlign: 'center', paddingTop: '2rem' }}>Loading Map...</p>}
    </div>
  );
};

export default MapView;

