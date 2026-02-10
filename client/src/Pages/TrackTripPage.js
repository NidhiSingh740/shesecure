import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://172.18.24.103:5000'; // Ensure this matches your IP

// --- STYLES ---
const TrackStyles = () => (
  <style>{`
    .track-container { height: 100vh; display: flex; flex-direction: column; font-family: 'Segoe UI', sans-serif; }
    .track-header { padding: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 1000; transition: background 0.3s; }
    .status-active { background: white; color: #333; }
    .status-sos { background: #dc3545; color: white; animation: pulse-red 1s infinite; }
    .status-completed { background: #28a745; color: white; }
    
    .status-text { margin: 0; font-size: 1.8rem; font-weight: 800; text-transform: uppercase; }
    .user-name { margin: 5px 0 0; font-size: 1rem; opacity: 0.9; }
    
    .map-area { flex: 1; width: 100%; }
    
    /* POPUP ALERT STYLE */
    .zone-alert-popup {
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 2000;
        text-align: center;
        border-left: 8px solid #28a745; /* Default Green */
        animation: slideDown 0.5s ease-out;
        width: 80%;
        max-width: 400px;
    }
    .zone-alert-danger { border-left-color: #dc3545; }
    .zone-alert-msg { font-size: 1.2rem; font-weight: bold; color: #333; margin-bottom: 10px; display: block; }
    .btn-close-alert { background: #eee; border: none; padding: 8px 20px; border-radius: 20px; cursor: pointer; font-weight: bold; }

    @keyframes pulse-red { 0% { background: #dc3545; } 50% { background: #b02a37; } 100% { background: #dc3545; } }
    @keyframes slideDown { from { top: -100px; opacity: 0; } to { top: 20%; opacity: 1; } }
  `}</style>
);

const loadLeaflet = (cb) => {
    if (window.L) return cb();
    const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = cb; document.head.appendChild(s);
    const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
};

const TrackTripPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [livePos, setLivePos] = useState(null);
  const [status, setStatus] = useState("active"); 
  const [zoneNotification, setZoneNotification] = useState(null); // NEW: Holds "Arrived at Home" message

  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    // 1. Fetch Trip Data
    axios.get(`${API_URL}/api/trips/${tripId}`)
         .then(res => {
            setTrip(res.data);
            if(res.data.status) setStatus(res.data.status);
            if(res.data.path?.length > 0) setLivePos(res.data.path[res.data.path.length-1]);
         })
         .catch(err => alert("Trip not found or link expired."));

    // 2. Connect Socket
    const socket = io(API_URL);
    socket.emit('joinTripRoom', tripId);
    
    // Listeners
    socket.on('tripUpdate', (coords) => setLivePos(coords));
    
    socket.on('tripEnded', () => { 
        setStatus('completed'); 
        alert("Trip has ended safely."); 
    });
    
    socket.on('sosAlert', () => {
        setStatus('sos');
        try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(()=>{}); } catch(e){}
    });
    
    socket.on('sosClear', () => setStatus('active'));

    // --- NEW: LISTEN FOR ZONE ALERTS ---
    socket.on('receiveZoneAlert', ({ message, type }) => {
        // Play a sound for attention
        try { new Audio('https://actions.google.com/sounds/v1/science_fiction/scifi_laser.ogg').play().catch(()=>{}); } catch(e){}
        
        // Show Popup
        setZoneNotification({ message, type });
        
        // Auto-hide after 10 seconds
        setTimeout(() => setZoneNotification(null), 10000);
    });

    // 3. Init Map
    loadLeaflet(() => {
        if(mapRef.current && !mapObj.current) {
            const L = window.L;
            mapObj.current = L.map(mapRef.current).setView([26.76, 83.37], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapObj.current);
            
            const blueIcon = new L.Icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41]
            });
            marker.current = L.marker([26.76, 83.37], {icon: blueIcon}).addTo(mapObj.current);
        }
    });

    return () => socket.disconnect();
  }, [tripId]);

  // Update Map Marker
  useEffect(() => {
      if(livePos && mapObj.current && window.L && marker.current) {
          const L = window.L;
          const lat = parseFloat(livePos.lat);
          const lng = parseFloat(livePos.lng);
          
          if(!isNaN(lat)) {
             marker.current.setLatLng([lat, lng]);
             mapObj.current.setView([lat, lng]);
             
             // Update Icon based on Status
             if (status === 'sos') {
                 const redIcon = new L.Icon({
                     iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                     iconSize: [25, 41], iconAnchor: [12, 41]
                 });
                 marker.current.setIcon(redIcon);
             } else {
                 const blueIcon = new L.Icon({
                     iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                     iconSize: [25, 41], iconAnchor: [12, 41]
                 });
                 marker.current.setIcon(blueIcon);
             }
          }
      }
  }, [livePos, status]);

  // --- RENDER ---
  let headerClass = 'status-active';
  let statusText = 'LIVE TRACKING';
  if (status === 'sos') { headerClass = 'status-sos'; statusText = '⚠️ SOS HELP NEEDED ⚠️'; }
  else if (status === 'completed') { headerClass = 'status-completed'; statusText = 'TRIP ENDED'; }

  return (
    <div className="track-container">
       <TrackStyles />
       
       <div className={`track-header ${headerClass}`}>
           <h1 className="status-text">{statusText}</h1>
           <p className="user-name">Tracking: {trip?.userId?.fullName || 'User'}</p>
           
           {/* Navigation Link */}
           {livePos && (
             <a href={`https://www.google.com/maps/dir/?api=1&destination=${livePos.lat},${livePos.lng}`} 
                target="_blank" 
                rel="noreferrer"
                style={{display:'inline-block', marginTop:'10px', background:'rgba(0,0,0,0.2)', color:'white', padding:'5px 15px', borderRadius:'20px', textDecoration:'none', fontSize:'0.9rem'}}>
                ↗ Open in Google Maps
             </a>
           )}
       </div>
       
       <div ref={mapRef} className="map-area"></div>

       {/* NEW: ZONE NOTIFICATION POPUP */}
       {zoneNotification && (
           <div className={`zone-alert-popup ${zoneNotification.type === 'Danger' ? 'zone-alert-danger' : ''}`}>
               <span className="zone-alert-msg">
                   {zoneNotification.type === 'Safe' ? '✅' : '⚠️'} {zoneNotification.message}
               </span>
               <button className="btn-close-alert" onClick={() => setZoneNotification(null)}>OK</button>
           </div>
       )}
    </div>
  );
};
export default TrackTripPage;