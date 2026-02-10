import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// --- CONFIG ---
const API_URL = 'http://172.18.24.167:5000'; // Ensure this matches your IP

// --- UTILS: GEOMETRY ---
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getDistanceFromLine = (p, a, b) => {
  const R = 6371e3;
  const d13 = getDistance(a.lat, a.lng, p.lat, p.lng) / R;
  const θ13 = Math.atan2(p.lng - a.lng, p.lat - a.lat);
  const θ12 = Math.atan2(b.lon - a.lng, b.lat - a.lat);
  return Math.asin(Math.sin(d13) * Math.sin(θ13 - θ12)) * R;
};

// --- STYLES ---
const DashboardStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap');

    /* --- GLOBAL LAYOUT & THEME --- */
    .dashboard-layout {
      display: flex;
      height: calc(100vh - 70px); /* Standard Desktop Height */
      background-color: #fce7f3; 
      position: relative;
      font-family: 'Poppins', sans-serif;
      overflow: hidden;
    }

    .map-column {
      flex: 6; 
      position: relative;
      z-index: 1;
      border-right: 1px solid rgba(255, 255, 255, 0.5);
    }

    .controls-column {
      flex: 4;
      min-width: 380px;
      background: linear-gradient(180deg, #ffffff 0%, #fff0f5 100%);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 1.25rem;
      z-index: 2;
      box-shadow: -5px 0 30px rgba(184, 54, 154, 0.1);
    }

    /* --- CARDS & CONTAINERS --- */
    .dashboard-card {
      background: #ffffff;
      border-radius: 24px; 
      padding: 1.5rem;
      box-shadow: 0 10px 40px rgba(184, 54, 154, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f3e8f0;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #b8369a; 
      font-weight: 700;
    }

    .manage-link {
      text-decoration: none;
      color: #b8369a; /* Fallback */
      background: -webkit-linear-gradient(0deg, #b8369a, #6a11cb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 4px 10px;
      background-color: #fdf2f8; /* BG is separate from text gradient */
      border-radius: 20px;
      transition: all 0.2s;
    }
    .manage-link:hover { background-color: #fce7f3; }

    /* --- INPUTS & FORMS --- */
    .destination-form label {
      font-weight: 600;
      color: #525252;
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .search-input-group {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      background: #fff;
      border-radius: 12px;
      padding: 4px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    }

    .search-input-group input {
      flex-grow: 1;
      padding: 10px 14px;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
      font-family: 'Poppins', sans-serif;
      min-width: 0; /* Fix flex overflow */
    }

    .search-input-group button {
      background: linear-gradient(90deg, #b8369a, #6a11cb);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0 1.2rem;
      cursor: pointer;
      font-weight: 600;
      transition: filter 0.2s;
      white-space: nowrap;
    }
    .search-input-group button:hover { filter: brightness(1.1); }

    /* --- RESULTS LIST --- */
    .results-section {
      margin-bottom: 1rem;
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid #f3e8f0;
      border-radius: 12px;
      background: white;
    }
    .results-list { list-style: none; padding: 0; margin: 0; }
    .results-list li {
      padding: 12px 15px;
      border-bottom: 1px solid #fdf2f8;
      cursor: pointer;
      font-size: 0.9rem;
      color: #4b5563;
      transition: all 0.2s;
    }
    .results-list li:hover { background-color: #fdf2f8; color: #db2777; padding-left: 20px; }

    /* --- CONTACTS --- */
    .contact-list { display: flex; flex-direction: column; gap: 0.8rem; }
    .contact-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 16px;
      background: white;
      border: 1px solid #fce7f3;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      transition: all 0.2s;
    }
    .contact-item:hover { transform: translateX(5px); border-color: #fbcfe8; }
    
    .contact-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f472b6 0%, #c084fc 100%);
      color: white;
      display: grid;
      place-items: center;
      font-weight: 700;
      margin-right: 15px;
      font-size: 1rem;
      box-shadow: 0 4px 10px rgba(192, 132, 252, 0.3);
      flex-shrink: 0;
    }
    
    .contact-details strong { display: block; color: #1f2937; font-size: 0.95rem; }
    .contact-details span { color: #9ca3af; font-size: 0.8rem; }

    /* --- MAIN ACTION BUTTON --- */
    .start-trip-button {
      width: 100%;
      padding: 16px;
      margin-top: 15px;
      background: linear-gradient(135deg, #db2777 0%, #7e22ce 100%);
      color: white;
      border: none;
      border-radius: 16px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(219, 39, 119, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      letter-spacing: 0.5px;
    }
    .start-trip-button:active { transform: scale(0.98); }
    .start-trip-button:disabled { background: #e5e7eb; color: #9ca3af; box-shadow: none; cursor: not-allowed; }

    /* --- TRIP STATUS CARD --- */
    .status-title {
      color: #059669; 
      font-size: 1.4rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .safe-check-box {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #fde68a;
      padding: 20px;
      border-radius: 20px;
      margin-bottom: 20px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(251, 191, 36, 0.15);
    }
    
    .timer-display { text-align: center; margin: 1.5rem 0; position: relative; }
    .timer-display p { margin: 0; color: #9ca3af; font-size: 0.8rem; letter-spacing: 1.5px; font-weight: 600; text-transform: uppercase; }
    .timer-display span {
      font-size: 3.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-variant-numeric: tabular-nums;
      display: block;
      margin-top: 5px;
    }

    .trip-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    
    .share-button {
      flex: 1;
      padding: 12px 8px; /* Increased padding for touch */
      background: white;
      color: #db2777;
      border: 1px solid #fbcfe8;
      border-radius: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(219, 39, 119, 0.1);
      display: flex; justify-content: center; align-items: center; gap: 5px;
    }
    .share-button:hover { background: #fff1f2; transform: translateY(-2px); }

    .end-trip-button {
      flex: 1;
      padding: 12px 8px; /* Increased padding for touch */
      background: linear-gradient(135deg, #be123c, #881337);
      color: white;
      border: none;
      border-radius: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(190, 18, 60, 0.3);
      transition: all 0.2s;
    }

    .btn-im-safe {
      background: linear-gradient(135deg, #db2777 0%, #7e22ce 100%);
      color: white;
      border: none;
      padding: 10px 16px; 
      width: 30%;
      min-width: 120px; /* Ensure minimum click width */
      border-radius: 16px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(219, 39, 119, 0.3);
      transition: transform 0.2s;
      margin: 0 auto 1rem auto; 
      display: block; 
    }
    .btn-im-safe:hover { transform: scale(1.02); }

    .secondary-icon-row {
      display: flex;
      justify-content: space-between; 
      align-items: center;
      margin-top: 15px;
      padding: 0 10px;
    }

    .sos-btn-floating {
      position: static; 
      width: 65px; 
      height: 65px; 
      background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
      border: 3px solid rgba(255,255,255,0.4);
      border-radius: 50%;
      color: white;
      font-weight: 800;
      font-size: 1rem;
      box-shadow: 0 10px 30px rgba(236, 72, 153, 0.5);
      cursor: pointer;
      z-index: 100;
      animation: sos-pulse 2s infinite;
      transition: transform 0.2s;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .sos-btn-floating:active { transform: scale(0.95); }

    @keyframes sos-pulse {
      0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7); }
      70% { box-shadow: 0 0 0 20px rgba(236, 72, 153, 0); }
      100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
    }

    .mic-btn-floating { 
      position: static;
      width: 60px; 
      height: 60px; 
      background: white; 
      border: none; 
      border-radius: 50%; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
      cursor: pointer; 
      z-index: 100;
      display: grid; 
      place-items: center; 
      font-size: 1.5rem; 
      transition: all 0.3s;
      color: #4b5563;
    }
    .mic-active { 
      background: #ef4444; color: white; 
      animation: pulse-mic 1s infinite; 
    }
    @keyframes pulse-mic {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    /* --- MODAL (DESKTOP DEFAULT) --- */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.4);
      z-index: 3000;
      display: flex;
      justify-content: flex-end; 
      align-items: center;
      backdrop-filter: blur(4px);
      padding-right: 20px; 
    }

    .modal-content {
      background: white;
      width: 350px;
      padding: 2rem;
      border-radius: 24px;
      box-shadow: -10px 0 40px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease-out;
      border: 1px solid white;
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      align-items: center;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 1rem;
    }
    .modal-header h3 { margin: 0; color: #db2777; font-size: 1.2rem; }
    
    .share-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #f9fafb;
      transition: background 0.2s;
      border-radius: 8px;
      cursor: pointer;
    }
    .share-item:hover { background: #fdf2f8; }

    .wa-btn {
      background: #25D366;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);
    }

    /* --- SAFETY SCORES --- */
    .safety-card {
      padding: 1rem;
      border-radius: 16px;
      margin-bottom: 1rem;
      text-align: center;
      border: 1px solid transparent;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .safety-score-high { background: #ecfdf5; border-color: #10b981; color: #047857; }
    .safety-score-med { background: #fffbeb; border-color: #f59e0b; color: #b45309; }
    .safety-score-low { background: #fef2f2; border-color: #ef4444; color: #b91c1c; }
    
    .score-value { font-size: 2.2rem; font-weight: 800; display: block; margin: 5px 0; }
    .score-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; opacity: 0.8; }
    
    .zone-mode-active {
      background-color: #fef2f2;
      border: 2px dashed #f87171;
      padding: 15px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 15px;
      font-weight: 700;
      color: #dc2626;
    }
    
    .zone-btn-row { display: flex; gap: 10px; margin-top: 10px; }
    .zone-form input, .zone-form select {
      width: 100%;
      margin-bottom: 10px;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      font-family: 'Poppins', sans-serif;
      box-sizing: border-box; /* Fix width issues */
    }

    /* --- SOS COUNTDOWN OVERLAY --- */
    .sos-countdown-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      z-index: 9999;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: white;
      text-align: center;
    }
    .countdown-number { font-size: 12rem; font-weight: 800; margin: 20px 0; text-shadow: 0 10px 30px rgba(0,0,0,0.3); }
    .btn-cancel-sos {
      background: white; color: #dc2626; padding: 18px 50px;
      font-size: 1.4rem; font-weight: 800; border: none; border-radius: 60px;
      cursor: pointer; box-shadow: 0 15px 40px rgba(0,0,0,0.4);
      transition: transform 0.2s;
    }
    .btn-cancel-sos:hover { transform: scale(1.05); }
    .search-error { color: #e11d48; font-size: 0.85rem; margin-top: 8px; font-weight: 500; }

    /* ========================================= */
    /* === RESPONSIVE TABLET & MOBILE STYLES === */
    /* ========================================= */

    /* TABLET (Portrait and small Laptop) - approx < 1024px */
    @media (max-width: 1024px) {
      .dashboard-layout {
        flex-direction: column; /* Stack Map and Controls vertically */
        height: 100vh; /* Use full height */
      }

      .map-column {
        flex: none; /* Disable flex scaling */
        height: 45vh; /* Map takes top 45% */
        width: 100%;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.5);
      }

      .controls-column {
        flex: 1; /* Takes remaining space */
        min-width: 0; /* Override the desktop min-width */
        width: 100%;
        border-radius: 24px 24px 0 0; /* Rounded top for "Sheet" look */
        margin-top: -24px; /* Pull up to overlap map slightly */
        padding: 1.5rem;
        box-sizing: border-box;
      }
      
      .btn-im-safe { width: 40%; }
      
      /* Center modal on tablet */
      .modal-overlay {
        justify-content: center;
        padding-right: 0;
        align-items: center;
      }
      .modal-content {
        width: 60%;
        animation: slideUp 0.3s ease-out; /* Slide up instead of right */
      }
      @keyframes slideInRight { /* Override to standard fade/up */
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    }

    /* MOBILE PHONE - approx < 768px */
    @media (max-width: 767px) {
      .dashboard-layout {
        height: 100vh;
        /* Mobile browsers often have dynamic toolbars, dvh is better if supported, else vh */
        height: 100dvh; 
      }
      
      .map-column {
        height: 40vh; /* Map slightly smaller on phone to give space to controls */
      }

      .controls-column {
        padding: 1.25rem 1rem; /* Less padding on sides */
        margin-top: -20px;
        gap: 1rem;
      }

      .dashboard-card {
        padding: 1rem; /* Compact card padding */
        border-radius: 20px;
      }
      
      .card-header h3 { font-size: 1rem; }
      
      .timer-display span { font-size: 2.8rem; } /* Smaller timer font */
      
      .btn-im-safe { width: 60%; font-size: 0.85rem; }
      
      .secondary-icon-row { margin-top: 10px; }
      .sos-btn-floating { width: 55px; height: 55px; font-size: 0.9rem; }
      .mic-btn-floating { width: 50px; height: 50px; font-size: 1.2rem; }

      /* Mobile Modal - Bottom Sheet Style */
      .modal-overlay {
        align-items: flex-end; /* Align to bottom */
        padding: 0;
      }
      .modal-content {
        width: 100%; /* Full width */
        border-radius: 24px 24px 0 0; /* Rounded top only */
        padding: 1.5rem;
        margin: 0;
        box-sizing: border-box;
        animation: slideUp 0.3s ease-out;
      }

      .countdown-number { font-size: 7rem; } /* Fix giant SOS number overflow */
      .btn-cancel-sos { padding: 15px 30px; font-size: 1.1rem; }
      
      .search-input-group button { padding: 0 0.8rem; font-size: 0.9rem; }
    }
  `}</style>
);
// --- LOAD LEAFLET ---
const loadLeaflet = (cb) => {
  if (window.L) return cb();
  const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
  const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = cb; document.head.appendChild(s);
};

// --- MAP VIEW ---
const MapView = ({ userPosition, destination, zones, onMapClick, isZoneMode }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const zoneLayersRef = useRef([]);

  useEffect(() => {
    loadLeaflet(() => {
      setTimeout(() => {
        if (window.L && mapContainerRef.current && !mapInstanceRef.current) {
          try {
            const L = window.L;
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            const lat = parseFloat(userPosition?.lat) || 26.7606;
            const lng = parseFloat(userPosition?.lng) || 83.3732;

            mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
            userMarkerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
            mapInstanceRef.current.invalidateSize();
          } catch (e) { console.error("Map Init Error", e); }
        }
      }, 100);
    });
  }, []);

  // Click Handler
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.off('click');
    mapInstanceRef.current.on('click', (e) => {
      if (onMapClick) onMapClick(e.latlng);
    });
  }, [onMapClick]);

  // Render Zones (With Delete)
  useEffect(() => {
    if (mapInstanceRef.current && window.L && zones) {
      zoneLayersRef.current.forEach(layer => layer.remove());
      zoneLayersRef.current = [];
      zones.forEach(zone => {
        const color = zone.type === 'Safe' ? 'green' : 'red';
        const circle = window.L.circle([zone.location.lat, zone.location.lng], {
          color: color, fillColor: color, fillOpacity: 0.2, radius: zone.radius || 200
        }).addTo(mapInstanceRef.current);

        const popupContent = `
                  <div style="text-align:center">
                      <b>${zone.name}</b><br/>${zone.type} Zone<br/>
                      <button onclick="window.handleDeleteZone('${zone._id}')" 
                              style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:4px; margin-top:5px; cursor:pointer; font-weight:bold;">
                          Delete Zone
                      </button>
                  </div>
              `;
        circle.bindPopup(popupContent);
        zoneLayersRef.current.push(circle);
      });
    }
  }, [zones]);

  // Update Positions
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      const L = window.L;
      try {
        const uLat = parseFloat(userPosition?.lat);
        const uLng = parseFloat(userPosition?.lng);
        if (!isNaN(uLat) && !isNaN(uLng) && userMarkerRef.current) {
          userMarkerRef.current.setLatLng([uLat, uLng]);
          if (!destination && !isZoneMode) mapInstanceRef.current.panTo([uLat, uLng]);
        }
        if (destination && destination.lat && destination.lon) {
          const dLat = parseFloat(destination.lat);
          const dLng = parseFloat(destination.lon);
          if (!destMarkerRef.current) destMarkerRef.current = L.marker([dLat, dLng]).addTo(mapInstanceRef.current);
          else destMarkerRef.current.setLatLng([dLat, dLng]);
          const path = [[uLat, uLng], [dLat, dLng]];
          if (!polylineRef.current) polylineRef.current = L.polyline(path, { color: '#4f46e5', weight: 4 }).addTo(mapInstanceRef.current);
          else polylineRef.current.setLatLngs(path);
          try { mapInstanceRef.current.fitBounds(path, { padding: [50, 50] }); } catch (e) { }
        }
      } catch (e) { console.error("Map Update Error", e); }
    }
  }, [userPosition, destination, isZoneMode]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', cursor: isZoneMode ? 'crosshair' : 'grab' }} />;
};

const BeforeTripPanel = ({ contacts, loading, searchTerm, setSearchTerm, onSearch, results, onSelectDest, dest, onStart, searchError, setSafeCheckInterval, setSafeCheckUnit, safeCheckUnit, safetyScore, toggleZoneMode, isZoneMode }) => (
  <div className="panel-container">
    <div className="dashboard-card trip-planning-module">
      <div className="card-header"><h3>Start a New Trip</h3></div>

      {isZoneMode ? (
        <div className="zone-mode-active">
          <p>📍 Click on the map to place a Safety Zone.</p>
          <button onClick={toggleZoneMode} style={{ padding: '5px 15px', border: '1px solid #aaa', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
        </div>
      ) : (
        <div className="destination-form">
          <label>Where are you going?</label>
          <div className="search-input-group">
            <input type="text" placeholder="Search destination..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={onSearch}>Search</button>
          </div>
          {searchError && <p className="search-error">{searchError}</p>}

          {results.length > 0 && (
            <div className="results-section">
              <ul className="results-list">
                {results.slice(0, 5).map((r) => (
                  <li key={r.place_id} onClick={() => onSelectDest({ lat: r.lat, lon: r.lon, display_name: r.display_name })} style={{ background: dest?.place_id === r.place_id ? '#f3e5f5' : '' }}>
                    {r.display_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dest && safetyScore !== null && (
            <div className={`safety-card ${safetyScore >= 75 ? 'safety-score-high' : safetyScore >= 50 ? 'safety-score-med' : 'safety-score-low'}`}>
              <small className="score-label">Route Safety Score</small>
              <span className="score-value">{safetyScore}/100</span>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                {safetyScore >= 75 ? "Safe Route ✅" : safetyScore >= 50 ? "Risky Route ⚠️" : "Danger Route ⛔"}
              </p>
            </div>
          )}

          {/* --- UNIT SELECTOR SECTION --- */}
          <div style={{ margin: '15px 0' }}>
            <label>Safe Check Interval:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                placeholder="Enter time duration"
                onChange={(e) => setSafeCheckInterval(e.target.value)}
                style={{
                  width: '70%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ced4da',
                  background: 'white',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <select
                style={{ width: '30%', padding: '12px', borderRadius: '8px', border: '1px solid #ced4da', background: 'white', outline: 'none', fontFamily: "'Poppins', sans-serif" }}
                value={safeCheckUnit}
                onChange={(e) => setSafeCheckUnit(e.target.value)}
              >
                <option value="minutes">Mins</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <div className="zone-btn-row">
            <button className="start-trip-button" onClick={onStart} disabled={!dest}>Start SafeWalk Trip</button>
            <button className="start-trip-button" onClick={toggleZoneMode} style={{ background: 'linear-gradient(90deg, #b8369a, #6a11cb)', width: '35%' }}>+ Add Zone</button>
          </div>
        </div>
      )}
    </div>

    <div className="dashboard-card contacts-module" style={{ flexGrow: 1, overflowY: 'auto' }}>
      <div className="card-header">
        <h3>Trusted Contacts</h3>
        <Link to="/contacts" className="manage-link">Manage</Link>
      </div>
      <div className="contact-list">
        {loading && <p>Loading contacts...</p>}
        {contacts.map(c => (
          <div key={c._id} className="contact-item">
            <div className="contact-avatar">{c.name.charAt(0)}</div>
            <div className="contact-details"><strong>{c.name}</strong><span>{c.phone}</span></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TripStatusPanel = ({ tripDetails, onEndTrip, contacts, onSOS, safeCheckSeconds, handleImSafe, zoneAlert, routeDeviationAlert, isVoiceListening, toggleVoiceMode }) => {
  const [time, setTime] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!tripDetails?.startedAt) return;
    const start = new Date(tripDetails.startedAt);
    const i = setInterval(() => setTime(Math.floor((new Date() - start) / 1000)), 1000);
    return () => clearInterval(i);
  }, [tripDetails]);

  const formatElapsedTime = (s) => new Date(s * 1000).toISOString().substr(11, 8);

  const formatCountdown = (seconds) => {
    if (isNaN(seconds) || seconds === null || seconds < 0) return "00:00";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleWhatsAppShare = (contact) => {
    const link = `${window.location.origin}/track/${tripDetails._id}`;
    const msg = `🚨 I started a SafeWalk trip! \n\nTrack my live location here:\n${link}`;
    const phone = contact.phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="panel-container">
      <div className="dashboard-card">
        <h3 className="status-title">Trip in Progress</h3>

        {zoneAlert && (
          <div className="route-alert" style={{ background: zoneAlert.type === 'Safe' ? '#d1fae5' : '#fee2e2', color: zoneAlert.type === 'Safe' ? '#065f46' : '#991b1b' }}>
            {zoneAlert.msg}
          </div>
        )}
        {routeDeviationAlert && <div className="route-alert">⚠️ Route Deviation Detected! You are off-track.</div>}

        {safeCheckSeconds !== null && (
          <div className="safe-check-box">
            <small style={{ fontWeight: 'bold', color: '#856404' }}>SAFE CHECK IN</small>
            <span className="safe-timer" style={{ color: safeCheckSeconds < 30 ? '#dc3545' : '#856404' }}>
              {formatCountdown(safeCheckSeconds)}
            </span>
            <button className="btn-im-safe" onClick={handleImSafe}>I'm Safe</button>
          </div>
        )}

        <div className="timer-display"><p>ELAPSED TIME</p><span>{formatElapsedTime(time)}</span></div>

        <div className="trip-actions">
          <button className="share-button" onClick={() => setShowModal(true)}>Share Link</button>
          <button className="end-trip-button" onClick={onEndTrip}>End Trip</button>
        </div>

        <div className="secondary-icon-row">
          <button className="sos-btn-floating" onClick={onSOS}>SOS</button>

          {isVoiceListening !== undefined && (
            <button className={`mic-btn-floating ${isVoiceListening ? 'mic-active' : ''}`} onClick={toggleVoiceMode}>
              {isVoiceListening ? '🎙️' : '🔇'}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Share with...</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#adb5bd' }}>×</button>
            </div>
            {contacts.length === 0 ? <p>No contacts found.</p> : contacts.map(c => (
              <div key={c._id} className="share-item">
                <div><strong>{c.name}</strong><br /><small style={{ color: '#888' }}>{c.phone}</small></div>
                <button className="wa-btn" onClick={() => handleWhatsAppShare(c)}>
                  Share on WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [isActive, setIsActive] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [destination, setDestination] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [userPos, setUserPos] = useState({ lat: 26.7606, lng: 83.3732 });
  const [searchError, setSearchError] = useState('');

  // FIX: Unit Selection State
  const [safeCheckInterval, setSafeCheckInterval] = useState('');
  const [safeCheckUnit, setSafeCheckUnit] = useState('minutes');
  const [safeCheckSeconds, setSafeCheckSeconds] = useState(null);
  const [sosCountdown, setSosCountdown] = useState(null);
  const [safetyScore, setSafetyScore] = useState(null);

  const [zones, setZones] = useState([]);
  const [isZoneMode, setIsZoneMode] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZoneCoords, setNewZoneCoords] = useState(null);
  const [activeZoneAlert, setActiveZoneAlert] = useState(null);
  const [routeDeviationAlert, setRouteDeviationAlert] = useState(false);
  const [insideZones, setInsideZones] = useState(new Set());
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // 1. DELETE FUNCTION
  useEffect(() => {
    window.handleDeleteZone = async (id) => {
      if (!window.confirm("Delete this zone?")) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/zones/${id}`, { headers: { 'x-auth-token': token } });
        setZones(prev => prev.filter(z => z._id !== id));
      } catch (e) { alert("Failed to delete zone"); }
    };
  }, []);

  // 2. LOAD DATA
  useEffect(() => {
    socketRef.current = io(API_URL);
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => console.error(e), { enableHighAccuracy: true }
    );
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    axios.get(`${API_URL}/api/contacts`, { headers: { 'x-auth-token': token } }).then(res => setContacts(res.data));
    axios.get(`${API_URL}/api/zones`, { headers: { 'x-auth-token': token } }).then(res => setZones(res.data)).finally(() => setLoading(false));

    return () => { if (socketRef.current) socketRef.current.disconnect(); if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [navigate]);

  // 3. VOICE SOS LOGIC
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (transcript.includes('help') || transcript.includes('emergency')) {
              triggerSOSSequence();
            }
          }
        }
      };
      recognitionRef.current.onend = () => { if (isVoiceListening) recognitionRef.current.start(); };
    }
  }, [isVoiceListening]);

  const toggleVoiceMode = () => {
    if (!recognitionRef.current) return alert("Browser does not support Speech");
    if (isVoiceListening) { recognitionRef.current.stop(); setIsVoiceListening(false); }
    else { recognitionRef.current.start(); setIsVoiceListening(true); }
  };

  // 4. GEOFENCING & NOTIFICATIONS
  useEffect(() => {
    if (!userPos) return;
    let changed = false;
    const currentInside = new Set(insideZones);
    zones.forEach(zone => {
      const dist = getDistance(userPos.lat, userPos.lng, zone.location.lat, zone.location.lng);
      const isInside = dist <= zone.radius;

      if (isInside && !currentInside.has(zone._id)) {
        currentInside.add(zone._id);
        changed = true;
        const msg = zone.type === 'Safe' ? `Arrived at ${zone.name}` : `⚠️ Entering ${zone.name}`;
        setActiveZoneAlert({ type: zone.type, msg });
        setTimeout(() => setActiveZoneAlert(null), 5000);
        if (isActive && tripDetails && socketRef.current) {
          socketRef.current.emit('zoneAlert', { tripId: tripDetails._id, message: msg, type: zone.type });
        }
      } else if (!isInside && currentInside.has(zone._id)) {
        currentInside.delete(zone._id);
        changed = true;
        if (zone.type === 'Safe') {
          const msg = `Leaving ${zone.name}`;
          setActiveZoneAlert({ type: 'Danger', msg });
          setTimeout(() => setActiveZoneAlert(null), 5000);
          if (isActive && tripDetails && socketRef.current) {
            socketRef.current.emit('zoneAlert', { tripId: tripDetails._id, message: msg, type: 'Danger' });
          }
        }
      }
    });
    if (changed) setInsideZones(currentInside);
    if (isActive && tripDetails && destination && tripDetails.startLocation) {
      const dev = getDistanceFromLine(userPos, tripDetails.startLocation, { lat: parseFloat(destination.lat), lng: parseFloat(destination.lon) });
      setRouteDeviationAlert(Math.abs(dev) > 500);
    }
  }, [userPos, zones, isActive, tripDetails, destination, insideZones]);

  // HANDLERS
  const handleSearch = async () => { try { const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`); setResults(res.data); } catch (e) { } };

  // FIX 2: Updated Safety Score Logic
  const calculateSafetyScore = async (destLat, destLon) => {
    try {
      const res = await axios.get(`${API_URL}/api/incidents`);
      const incidents = res.data;

      if (!incidents || incidents.length === 0) {
        setSafetyScore(100);
        return;
      }

      let nearbyCount = 0;
      let seriousIncidentFound = false;
      let riskyIncidentFound = false;

      const R = 6371;
      incidents.forEach(inc => {
        const dLat = (inc.location.lat - destLat) * Math.PI / 180;
        const dLon = (inc.location.lng - destLon) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(destLat * Math.PI / 180) * Math.cos(inc.location.lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;

        if (d < 2) {
          nearbyCount++;
          const type = inc.type ? inc.type.toLowerCase() : '';
          if (type.includes('theft') || type.includes('harassment') || type.includes('assault')) {
            seriousIncidentFound = true;
          } else if (type.includes('lighting') || type.includes('poor')) {
            riskyIncidentFound = true;
          }
        }
      });

      // Logic: Base 100.
      // Theft/Harassment -> Force < 50 (e.g., 45)
      // Poor Lighting -> Force 50-70 (e.g., 65)
      // Else -> 100 - (count * 10)

      let score = 100 - (nearbyCount * 10);

      if (seriousIncidentFound) {
        score = Math.min(score, 45); // Cap at 45 (Danger)
      } else if (riskyIncidentFound) {
        score = Math.min(Math.max(score, 50), 70); // Force between 50-70 (Risky)
        if (score > 70) score = 65;
      }

      if (score < 30) score = 30; // Floor
      setSafetyScore(score);

    } catch (e) { setSafetyScore(null); }
  };

  const handleSelectDest = (d) => { setDestination(d); calculateSafetyScore(parseFloat(d.lat), parseFloat(d.lon)); };

  // FIX: START TRIP TIMER CALCULATION (Respects Units)
  const startTrip = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/api/trips/start`, { destination: { name: destination.display_name, lat: destination.lat, lon: destination.lon }, startLocation: userPos }, { headers: { 'x-auth-token': token } });
    setTripDetails(res.data); setIsActive(true);

    if (safeCheckInterval) {
      let multiplier = 60; // Default Minutes
      if (safeCheckUnit === 'hours') multiplier = 3600;
      if (safeCheckUnit === 'days') multiplier = 86400;

      // Ensure parsing is base 10 to avoid any octal issues
      const val = parseInt(safeCheckInterval, 10);
      if (!isNaN(val)) {
        setSafeCheckSeconds(val * multiplier);
      } else {
        setSafeCheckSeconds(null);
      }
    }

    socketRef.current.emit('joinTripRoom', res.data._id);
    watchIdRef.current = navigator.geolocation.watchPosition(p => {
      const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
      setUserPos(coords);
      socketRef.current.emit('updateLocation', { tripId: res.data._id, coordinates: coords });
    }, console.error, { enableHighAccuracy: true });
  };

  const triggerSOSSequence = () => setSosCountdown(5);
  const sendSOS = async () => { if (tripDetails && socketRef.current) socketRef.current.emit('sosTriggered', tripDetails._id); };

  // FIX: RESET TIMER ON SAFE (Respects Units)
  const handleImSafe = async () => {
    if (safeCheckInterval) {
      let multiplier = 60;
      if (safeCheckUnit === 'hours') multiplier = 3600;
      if (safeCheckUnit === 'days') multiplier = 86400;
      const val = parseInt(safeCheckInterval, 10);
      if (!isNaN(val)) {
        setSafeCheckSeconds(val * multiplier);
      }
    }
    if (tripDetails && socketRef.current) socketRef.current.emit('sosCancelled', tripDetails._id);
    alert("Safe status sent.");
  };

  const endTrip = async () => {
    if (tripDetails && socketRef.current) socketRef.current.emit('endTrip', tripDetails._id);
    setIsActive(false); setTripDetails(null); setDestination(null); alert("Trip Ended"); setIsVoiceListening(false);
  };

  // ZONE HANDLERS
  const toggleZoneMode = () => setIsZoneMode(!isZoneMode);
  const handleMapClick = useCallback((latlng) => { if (isZoneMode) { setNewZoneCoords(latlng); setShowZoneModal(true); } }, [isZoneMode]);
  const saveZone = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    const data = { name: formData.get('name'), type: formData.get('type'), radius: formData.get('radius'), lat: newZoneCoords.lat, lng: newZoneCoords.lng };
    try {
      const res = await axios.post(`${API_URL}/api/zones`, data, { headers: { 'x-auth-token': token } });
      setZones([...zones, res.data]); setShowZoneModal(false); setIsZoneMode(false);
    } catch (err) { alert('Error'); }
  };

  // TIMERS
  useEffect(() => {
    let t;
    if (isActive && safeCheckSeconds !== null && sosCountdown === null) {
      t = setInterval(() => {
        setSafeCheckSeconds(p => {
          if (p <= 1) {
            triggerSOSSequence();
            // Auto-reset logic logic if needed, currently manual reset via button
            // Calculate reset value:
            let multiplier = 60;
            if (safeCheckUnit === 'hours') multiplier = 3600;
            if (safeCheckUnit === 'days') multiplier = 86400;
            return parseInt(safeCheckInterval, 10) * multiplier;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isActive, safeCheckSeconds, sosCountdown, safeCheckInterval, safeCheckUnit]);

  useEffect(() => { let t; if (sosCountdown !== null) { if (sosCountdown > 0) t = setInterval(() => setSosCountdown(p => p - 1), 1000); else { sendSOS(); setSosCountdown(null); } } return () => clearInterval(t); }, [sosCountdown]);

  return (
    <div className="dashboard-layout">
      <DashboardStyles />
      <div className="map-column">
        <MapView userPosition={userPos} destination={destination} zones={zones} onMapClick={handleMapClick} isZoneMode={isZoneMode} />
      </div>
      <div className="controls-column">
        {isActive ? (
          <TripStatusPanel
            tripDetails={tripDetails}
            onEndTrip={endTrip}
            contacts={contacts}
            onSOS={triggerSOSSequence}
            safeCheckSeconds={safeCheckSeconds}
            handleImSafe={handleImSafe}
            zoneAlert={activeZoneAlert}
            routeDeviationAlert={routeDeviationAlert}
            isVoiceListening={isVoiceListening}
            toggleVoiceMode={toggleVoiceMode}
          />
        ) : (
          <BeforeTripPanel
            contacts={contacts} loading={loading} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} results={results} onSelectDest={handleSelectDest} dest={destination} onStart={startTrip} searchError={searchError}
            setSafeCheckInterval={setSafeCheckInterval}
            setSafeCheckUnit={setSafeCheckUnit}
            safeCheckUnit={safeCheckUnit}
            safetyScore={safetyScore} toggleZoneMode={toggleZoneMode} isZoneMode={isZoneMode}
          />
        )}
      </div>
      {sosCountdown !== null && <div className="sos-countdown-overlay"><h1 style={{ fontSize: '3rem' }}>SOS IN...</h1><div className="countdown-number">{sosCountdown}</div><button className="btn-cancel-sos" onClick={() => setSosCountdown(null)}>CANCEL</button></div>}

      {/* FIX 1: Add Zone Modal (Reverted to your simpler UI) */}
      {showZoneModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Safety Zone</h3>
            <form onSubmit={saveZone} className="zone-form">
              <input name="name" placeholder="Name" required />
              <select name="type"><option value="Safe">Safe</option><option value="Danger">Danger</option></select>
              <input name="radius" type="number" defaultValue="200" required />
              <button type="submit" className="start-trip-button">Save Zone</button>
              <button type="button" onClick={() => setShowZoneModal(false)} style={{ marginTop: '10px', background: 'none', border: 'none' }}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;