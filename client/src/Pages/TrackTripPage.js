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
    const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = cb; document.head.appendChild(s);
    const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
  };

  useEffect(() => {
    // Fetch Trip
    axios.get(`${API_URL}/api/trips/${tripId}`).then(res => {
        setTrip(res.data);
        if (res.data.status === 'sos') setStatus('sos');
        else if (res.data.status === 'completed') setStatus('ended');
        
        if(res.data.path?.length > 0) setLivePos(res.data.path[res.data.path.length-1]);
    });

    const socket = io(API_URL);
    socket.emit('joinTripRoom', tripId);
    
    socket.on('tripUpdate', (coords) => setLivePos(coords));
    socket.on('tripEnded', () => { setStatus('ended'); alert("Trip Ended"); });
    
    // LISTEN FOR SOS
    socket.on('sosAlert', () => {
        setStatus('sos');
        try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(()=>{}); } catch(e){}
    });

    loadLeaflet(() => {
        if(mapRef.current && !mapObj.current) {
            const L = window.L;
            mapObj.current = L.map(mapRef.current).setView([26.76, 83.37], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapObj.current);
            marker.current = L.marker([26.76, 83.37]).addTo(mapObj.current);
        }
    });

    return () => socket.disconnect();
  }, [tripId]);

  // Update Map & Marker Style based on Status
  useEffect(() => {
      if(livePos && mapObj.current && window.L) {
          const lat = parseFloat(livePos.lat);
          const lng = parseFloat(livePos.lng);
          if(!isNaN(lat)) {
              marker.current.setLatLng([lat, lng]);
              mapObj.current.setView([lat, lng]);
              
              // CHANGE MARKER COLOR IF SOS
              if (status === 'sos') {
                  const redIcon = new window.L.Icon({
                      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
                  });
                  marker.current.setIcon(redIcon);
              }
          }
      }
  }, [livePos, status]);

  // Dynamic Styles based on status
  const getHeaderStyle = () => {
      if (status === 'sos') return { background: '#ef4444', color: 'white' };
      if (status === 'ended') return { background: '#eee', color: '#666' };
      return { background: 'white', color: '#111' };
  };

  return (
    <div style={{height: '100vh', display:'flex', flexDirection:'column'}}>
       <div style={{padding:'20px', textAlign:'center', boxShadow:'0 2px 5px rgba(0,0,0,0.1)', zIndex:1000, ...getHeaderStyle()}}>
           <h2>Tracking {trip?.userId?.fullName || 'User'}</h2>
           <h3>
               {status === 'active' && "🟢 LIVE TRACKING"}
               {status === 'ended' && "🛑 TRIP ENDED"}
               {status === 'sos' && "⚠️ SOS TRIGGERED - HELP NEEDED ⚠️"}
           </h3>
           
           {/* GET DIRECTIONS BUTTON */}
           {livePos && (
               <a 
                 href={`https://www.google.com/maps/dir/?api=1&destination=${livePos.lat},${livePos.lng}`} 
                 target="_blank" 
                 rel="noreferrer"
                 style={{display:'inline-block', marginTop:'10px', background: status === 'sos' ? 'white' : '#4f46e5', color: status === 'sos' ? 'red' : 'white', padding:'10px 20px', borderRadius:'5px', textDecoration:'none', fontWeight:'bold'}}
               >
                   GET DIRECTIONS (GOOGLE MAPS)
               </a>
           )}
       </div>
       <div ref={mapRef} style={{flex:1}}></div>
    </div>
  );
};
export default TrackTripPage;