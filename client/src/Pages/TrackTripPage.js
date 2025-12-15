// src/Pages/TrackTripPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000'; // your backend URL

const TrackTripPage = () => {
  const { tripId } = useParams();

  const [trip, setTrip] = useState(null);
  const [livePos, setLivePos] = useState(null);
  const [isEnded, setIsEnded] = useState(false);
  const [error, setError] = useState('');

  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const marker = useRef(null);
  const pollIntervalRef = useRef(null);
  const socketRef = useRef(null);

  // load Leaflet JS + CSS from CDN
  const loadLeaflet = (cb) => {
    if (window.L) return cb();
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = cb;
    document.head.appendChild(s);

    const c = document.createElement('link');
    c.rel = 'stylesheet';
    c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(c);
  };

  // 1) Setup map once
  useEffect(() => {
    loadLeaflet(() => {
      if (mapRef.current && !mapObj.current) {
        const L = window.L;
        mapObj.current = L.map(mapRef.current).setView([26.76, 83.37], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
          .addTo(mapObj.current);

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        marker.current = L.marker([26.76, 83.37]).addTo(mapObj.current);
      }
    });
  }, []);

  // 2) Connect to Socket.IO for real-time updates
  useEffect(() => {
    // Connect to socket
    socketRef.current = io(API_URL);

    // Join the trip room to receive updates
    socketRef.current.emit('joinTripRoom', tripId);

    // Listen for real-time location updates
    socketRef.current.on('tripUpdate', (coordinates) => {
      setLivePos(coordinates);
    });

    // Listen for trip ended event - this is the key fix!
    socketRef.current.on('tripEnded', () => {
      console.log('🛑 Received tripEnded event from server');
      setIsEnded(true);
      // Stop polling since trip is ended
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [tripId]);

  // 3) Poll trip status every 3 seconds (as fallback)
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/trips/${tripId}`);
        setTrip(res.data);
        setIsEnded(!res.data.isActive);

        if (res.data.path && res.data.path.length > 0) {
          const last = res.data.path[res.data.path.length - 1];
          setLivePos(last);
        }

        // Stop polling if trip is already ended
        if (!res.data.isActive && pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } catch (err) {
        console.error('Polling error', err);
        setError('Could not load trip. It may have been deleted or ended.');
        // optional: stop polling on fatal error
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    };

    // initial fetch
    fetchTrip();

    // poll every 3 seconds
    pollIntervalRef.current = setInterval(fetchTrip, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [tripId]);

  // 3) Update marker when livePos changes
  useEffect(() => {
    if (livePos && mapObj.current && window.L && marker.current) {
      const lat = parseFloat(livePos.lat);
      const lng = parseFloat(livePos.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        marker.current.setLatLng([lat, lng]);
        mapObj.current.setView([lat, lng]);
      }
    }
  }, [livePos]);

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '20px',
          background: 'white',
          textAlign: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}
      >
        <h2>Tracking {trip?.userId?.fullName || 'Trip'}</h2>
        {isEnded
          ? <h3 style={{ color: 'red' }}>TRIP ENDED</h3>
          : <h3 style={{ color: 'green' }}>TRIP IN PROGRESS</h3>}
      </div>
      <div ref={mapRef} style={{ flex: 1 }}></div>
    </div>
  );
};

export default TrackTripPage;
