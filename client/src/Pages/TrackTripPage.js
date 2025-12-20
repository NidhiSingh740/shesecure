import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://172.18.24.204:5000';

const TrackTripPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [livePos, setLivePos] = useState(null);
  const [status, setStatus] = useState("active"); // active, ended, sos
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const marker = useRef(null);

  const loadLeaflet = (cb) => {
    if (window.L) return cb();
    const s=document.createElement('script'); s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload=cb; document.head.appendChild(s);
    const c=document.createElement('link'); c.rel='stylesheet'; c.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
  };

  useEffect(() => {
    // 1. Fetch Trip
    axios.get(`${API_URL}/api/trips/${tripId}`).then(res => {
        setTrip(res.data);
        if(res.data.status) setStatus(res.data.status); // Set initial status from DB
        if(res.data.path?.length > 0) setLivePos(res.data.path[res.data.path.length-1]);
    });

    const socket = io(API_URL);
    socket.emit('joinTripRoom', tripId);
    
    socket.on('tripUpdate', (coords) => setLivePos(coords));
    socket.on('tripEnded', () => { setStatus('completed'); alert("Trip Ended"); });
    
    // --- LISTEN FOR SOS ---
    socket.on('sosAlert', () => {
        setStatus('sos');
        try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(()=>{}); } catch(e){}
    });
    
    // --- LISTEN FOR CLEAR ---
    socket.on('sosClear', () => {
        setStatus('active'); // Back to normal
    });

    loadLeaflet(() => {
        if(mapRef.current && !mapObj.current) {
            const L = window.L;
            mapObj.current = L.map(mapRef.current).setView([26.76, 83.37], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapObj.current);
            
            // Standard Blue Icon
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

  // Update Marker & Handle Color Change
  useEffect(() => {
      if(livePos && mapObj.current && window.L && marker.current) {
          const L = window.L;
          const lat = parseFloat(livePos.lat);
          const lng = parseFloat(livePos.lng);
          
          if(!isNaN(lat)) {
             marker.current.setLatLng([lat, lng]);
             mapObj.current.setView([lat, lng]);
             
             // SWITCH ICON COLOR
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
  const headerStyle = status === 'sos' ? {background: '#ef4444', color: 'white'} : {background: 'white', color: '#111'};
  const statusText = status === 'sos' ? '⚠️ SOS HELP NEEDED ⚠️' : (status === 'completed' ? 'TRIP ENDED' : 'LIVE TRACKING');

  return (
    <div style={{height: '100vh', display:'flex', flexDirection:'column'}}>
       <div style={{padding:'20px', textAlign:'center', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', zIndex:1000, ...headerStyle}}>
           <h2>Tracking {trip?.userId?.fullName}</h2>
           <h1 style={{fontSize:'1.5rem', marginTop:'5px'}}>{statusText}</h1>
           
           {/* Navigation Button */}
           {livePos && (
             <a href={`https://www.google.com/maps/dir/?api=1&destination=${livePos.lat},${livePos.lng}`} 
                target="_blank" 
                rel="noreferrer"
                style={{display:'inline-block', marginTop:'10px', background: status==='sos'?'white':'#4f46e5', color: status==='sos'?'#ef4444':'white', padding:'8px 15px', borderRadius:'5px', textDecoration:'none', fontWeight:'bold'}}>
                GET DIRECTIONS
             </a>
           )}
       </div>
       
       {/* Map is ALWAYS visible below */}
       <div ref={mapRef} style={{flex:1}}></div>
    </div>
  );
};
export default TrackTripPage;