
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// --- STYLES AND SCRIPT LOADERS (Self-Contained) ---
// To resolve the build errors, we will load Leaflet's CSS and JS from a CDN
// and embed the component's own styles directly.

const TrackTripPageStyles = () => (
  <style>{`
    .track-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .track-header {
      padding: 1rem 2rem;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      text-align: center;
      flex-shrink: 0;
    }
    .track-header h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #111827;
    }
    .track-header p {
      margin: 0.25rem 0 0;
      color: #6b7280;
    }
    .track-header .active { color: #16a34a; font-weight: bold; }
    .track-header .ended { color: #dc2626; font-weight: bold; }
    .loading-container, .error-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-size: 1.2rem;
        color: #4b5563;
    }
    .error-text { color: #dc2626; }
  `}</style>
);

// Injects the required Leaflet CSS into the document's head
const loadLeafletCSS = () => {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
};

// Injects the Leaflet JavaScript library and calls a function when it's ready
const loadLeafletScript = (callback) => {
  if (window.L) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = () => callback();
  document.head.appendChild(script);
};

const TrackTripPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [livePosition, setLivePosition] = useState(null);
  const [error, setError] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  
  const socketRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const polylineInstanceRef = useRef(null);

  useEffect(() => {
    loadLeafletCSS();
    loadLeafletScript(() => setIsMapReady(true));

    const fetchTrip = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trips/${tripId}`);
        setTrip(res.data);
        if (res.data.path.length > 0) {
          const lastPos = res.data.path[res.data.path.length - 1];
          setLivePosition({ lat: lastPos.lat, lng: lastPos.lng });
        }
      } catch (err) {
        setError('Could not find or load the trip.');
      }
    };

    fetchTrip();

    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('joinTripRoom', tripId);
    socketRef.current.on('tripUpdate', (newCoordinates) => {
      setLivePosition(newCoordinates);
      setTrip(prevTrip => prevTrip ? { ...prevTrip, path: [...prevTrip.path, newCoordinates] } : null);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [tripId]);
  
  useEffect(() => {
    if (isMapReady && mapContainerRef.current && livePosition && window.L) {
      const L = window.L;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([livePosition.lat, livePosition.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
        
        const customIcon = new L.Icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41]
        });
        markerInstanceRef.current = L.marker([livePosition.lat, livePosition.lng], { icon: customIcon }).addTo(mapInstanceRef.current);
      } else {
        mapInstanceRef.current.panTo([livePosition.lat, livePosition.lng]);
        markerInstanceRef.current.setLatLng([livePosition.lat, livePosition.lng]);
      }
      
      if (trip && trip.path.length > 0) {
        const pathPositions = trip.path.map(p => [p.lat, p.lng]);
        if (!polylineInstanceRef.current) {
          polylineInstanceRef.current = L.polyline(pathPositions, { color: 'blue' }).addTo(mapInstanceRef.current);
        } else {
          polylineInstanceRef.current.setLatLngs(pathPositions);
        }
      }
    }
  }, [isMapReady, livePosition, trip]);

  if (error) return <div className="error-container"><p className="error-text">{error}</p></div>;
  if (!trip) return <div className="loading-container"><p>Loading trip details...</p></div>;

  return (
    <>
      <TrackTripPageStyles />
      <div className="track-container">
        <div className="track-header">
          <h1>Tracking {trip.userId.fullName}'s Trip</h1>
          <p>Status: <span className={trip.isActive ? 'active' : 'ended'}>{trip.isActive ? 'In Progress' : 'Ended'}</span></p>
        </div>
        <div ref={mapContainerRef} style={{ flexGrow: 1, width: '100%' }} />
      </div>
    </>
  );
};

export default TrackTripPage;

