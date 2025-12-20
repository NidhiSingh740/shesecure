import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// CONFIG
const API_URL = 'http://172.18.24.204:5000';

// STYLES
const DashboardStyles = () => (
  <style>{`
    .dashboard-layout { display: flex; height: calc(100vh - 70px); background-color: #f3f4f6; position: relative; }
    .map-column { flex: 3; background-color: #e5e7eb; position: relative; }
    .controls-column { flex: 2; background-color: #ffffff; padding: 1.5rem 2rem; display: flex; flex-direction: column; overflow-y: hidden; }
    .panel-container { display: flex; flex-direction: column; height: 100%; position: relative; }
    
    /* SOS OVERLAY (The Grace Period) */
    .sos-countdown-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(220, 38, 38, 0.95); z-index: 9999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        color: white; animation: pulse-bg 1s infinite;
    }
    .countdown-number { font-size: 8rem; font-weight: 800; margin: 20px 0; }
    .btn-cancel-sos {
        background: white; color: #dc2626; padding: 15px 40px; font-size: 1.5rem;
        font-weight: bold; border: none; border-radius: 50px; cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    @keyframes pulse-bg { 0% { background: rgba(220, 38, 38, 0.9); } 50% { background: rgba(185, 28, 28, 0.95); } 100% { background: rgba(220, 38, 38, 0.9); } }

    /* SOS Floating Button */
    .sos-btn-floating {
        position: absolute; bottom: 30px; right: 30px; width: 80px; height: 80px;
        background: radial-gradient(circle, #ff4d4d 0%, #cc0000 100%);
        border: 4px solid white; border-radius: 50%; color: white; font-weight: bold; font-size: 1.2rem;
        box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4); cursor: pointer; z-index: 1000;
    }

    /* Safe Check Box */
    .safe-check-box { background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .safe-timer { font-size: 1.5rem; font-weight: bold; color: #856404; display: block; margin: 10px 0; }
    .btn-im-safe { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; width: 100%; }

    /* Standard UI */
    .start-trip-button { width: 100%; padding: 1rem; margin-top: 1rem; background: linear-gradient(90deg, #b669a4, #8d5ec1); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
    .start-trip-button:disabled { background: #c4b5fd; cursor: not-allowed; }
    .share-button { flex: 1; padding: 1rem; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
    .end-trip-button { flex: 1; padding: 1rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
    
    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; justify-content: center; align-items: center; }
    .modal-content { background: white; width: 90%; max-width: 400px; padding: 2rem; border-radius: 12px; }
    .share-item { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; border-bottom: 1px solid #eee; }
    .wa-btn { background: #25D366; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.9rem; text-decoration: none; }
    
    input { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing:border-box;}
    .search-row { display: flex; gap: 5px; }
    .btn-search { background: #4f46e5; color: white; padding: 0 15px; border:none; border-radius:4px; cursor:pointer;}
  `}</style>
);

// --- LEAFLET HELPERS ---
const loadLeaflet = (cb) => {
  if (window.L) return cb();
  const c = document.createElement('link'); c.rel='stylesheet'; c.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
  const s = document.createElement('script'); s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload=cb; document.head.appendChild(s);
};

// --- MAP VIEW (Safe) ---
const MapView = ({ userPosition, destination }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarker = useRef(null);
  const destMarker = useRef(null);
  const line = useRef(null);

  useEffect(() => {
    loadLeaflet(() => {
      // Use setTimeout to ensure container exists
      setTimeout(() => {
        if (window.L && mapRef.current && !mapInstance.current) {
            try {
                const L = window.L;
                const lat = parseFloat(userPosition.lat) || 26.76;
                const lng = parseFloat(userPosition.lng) || 83.37;
                mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
                userMarker.current = L.marker([lat, lng]).addTo(mapInstance.current);
            } catch(e){}
        }
      }, 100);
    });
  }, []);

  useEffect(() => {
    if (mapInstance.current && window.L) {
      const L = window.L;
      try {
        const uLat = parseFloat(userPosition?.lat);
        const uLng = parseFloat(userPosition?.lng);
        if(!isNaN(uLat) && userMarker.current) userMarker.current.setLatLng([uLat, uLng]);

        if (destination && destination.lat) {
            const dLat = parseFloat(destination.lat);
            const dLng = parseFloat(destination.lon);
            if (!isNaN(dLat)) {
                if (!destMarker.current) destMarker.current = L.marker([dLat, dLng]).addTo(mapInstance.current);
                else destMarker.current.setLatLng([dLat, dLng]);

                if(!line.current) line.current = L.polyline([[uLat, uLng], [dLat, dLng]], { color: '#4f46e5' }).addTo(mapInstance.current);
                else line.current.setLatLngs([[uLat, uLng], [dLat, dLng]]);
                
                try { mapInstance.current.fitBounds(line.current.getBounds(), { padding: [50, 50] }); } catch(e){}
            }
        }
      } catch(e) {}
    }
  }, [userPosition, destination]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

// --- BEFORE TRIP ---
const BeforeTripPanel = ({ contacts, searchTerm, setSearchTerm, onSearch, results, onSelectDest, dest, onStart, setSafeCheckInterval }) => (
    <div className="panel-container">
        <h3>Start Trip</h3>
        <div className="search-row">
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Destination..." />
            <button className="btn-search" onClick={onSearch}>Search</button>
        </div>
        <ul style={{listStyle:'none', padding:0}}>
            {results.slice(0,3).map(r => (
                <li key={r.place_id} onClick={() => onSelectDest({lat: r.lat, lon: r.lon, display_name: r.display_name})} 
                    style={{padding:'10px', borderBottom:'1px solid #eee', background: dest?.place_id === r.place_id ? '#e0e7ff':''}}>
                    {r.display_name}
                </li>
            ))}
        </ul>
        <div style={{margin:'15px 0'}}>
            <label>Safe Check Interval:</label>
            <select style={{width:'100%', padding:'10px'}} onChange={(e) => setSafeCheckInterval(e.target.value)}>
                <option value="">Off</option>
                <option value="0.2">12 Seconds (Test)</option>
                <option value="1">1 Minute</option>
                <option value="15">15 Minutes</option>
            </select>
        </div>
        <button className="start-trip-button" onClick={onStart} disabled={!dest}>Start SafeWalk</button>
        <div style={{marginTop:'20px'}}>
             <h4>Contacts</h4>
             {contacts.map(c => <div key={c._id} style={{padding:'5px'}}>👤 {c.name}</div>)}
        </div>
    </div>
);

// --- ACTIVE TRIP ---
const TripStatusPanel = ({ tripDetails, onEndTrip, contacts, onTriggerSOS, safeCheckSeconds, handleImSafe }) => {
    const [showModal, setShowModal] = useState(false);
    const [time, setTime] = useState(0);

    useEffect(() => {
        if(!tripDetails?.startedAt) return;
        const start = new Date(tripDetails.startedAt);
        const i = setInterval(() => setTime(Math.floor((new Date() - start) / 1000)), 1000);
        return () => clearInterval(i);
    }, [tripDetails]);

    const format = (s) => new Date(s * 1000).toISOString().substr(11, 8);

    const handleShare = (contact) => {
        const link = `${window.location.origin}/track/${tripDetails._id}`;
        const msg = `🚨 I started a SafeWalk trip! Track me: ${link}`;
        window.open(`https://api.whatsapp.com/send?phone=${contact.phone.replace(/\D/g,'')}&text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="panel-container">
            <h3 style={{textAlign:'center', color:'green'}}>Trip Active</h3>
            
            {safeCheckSeconds !== null && (
                <div className="safe-check-box">
                    <small>SAFE CHECK IN</small>
                    <span className="safe-timer" style={{color: safeCheckSeconds < 10 ? 'red' : 'inherit'}}>
                        {Math.floor(safeCheckSeconds / 60)}:{String(safeCheckSeconds % 60).padStart(2,'0')}
                    </span>
                    <button className="btn-im-safe" onClick={handleImSafe}>I'm Safe (Reset)</button>
                </div>
            )}

            <div style={{textAlign:'center', margin:'20px'}}><p>TIME</p><span style={{fontSize:'3rem'}}>{format(time)}</span></div>
            
            <div style={{display:'flex', gap:'10px'}}>
                <button className="share-button" onClick={() => setShowModal(true)}>Share Link</button>
                <button className="end-trip-button" onClick={onEndTrip}>End Trip</button>
            </div>
            
            <button className="sos-btn-floating" onClick={onTriggerSOS}>SOS</button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Share <button onClick={()=>setShowModal(false)} style={{float:'right'}}>x</button></h3>
                        {contacts.map(c => (
                            <div key={c._id} className="share-item">
                                <strong>{c.name}</strong>
                                <button className="wa-btn" onClick={() => handleShare(c)}>WhatsApp</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- DASHBOARD CONTROLLER ---
const Dashboard = () => {
  const [isActive, setIsActive] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [dest, setDest] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [userPos, setUserPos] = useState({ lat: 26.76, lng: 83.37 });
  
  // Safe Check & SOS
  const [safeCheckInterval, setSafeCheckInterval] = useState(null);
  const [safeCheckSeconds, setSafeCheckSeconds] = useState(null);
  const [sosCountdown, setSosCountdown] = useState(null); // The 5-second countdown

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(API_URL);
    navigator.geolocation.getCurrentPosition(p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }));
    const token = localStorage.getItem('token');
    if(token) axios.get(`${API_URL}/api/contacts`, { headers: { 'x-auth-token': token } }).then(res => setContacts(res.data));
    return () => socketRef.current.disconnect();
  }, [navigate]);

  // Safe Check Countdown
  useEffect(() => {
      let t;
      if (isActive && safeCheckSeconds !== null && sosCountdown === null) {
          t = setInterval(() => {
              setSafeCheckSeconds(prev => {
                  if (prev <= 1) {
                      triggerSOSSequence(); // TIMER HIT 0 -> START SOS COUNTDOWN
                      return parseFloat(safeCheckInterval) * 60; // Reset
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(t);
  }, [isActive, safeCheckSeconds, sosCountdown]);

  // SOS Countdown (5..4..3..)
  useEffect(() => {
      let t;
      if (sosCountdown !== null) {
          if (sosCountdown > 0) {
              t = setInterval(() => setSosCountdown(prev => prev - 1), 1000);
          } else {
              // COUNTDOWN FINISHED -> SEND ALERT
              sendSOS();
              setSosCountdown(null);
          }
      }
      return () => clearInterval(t);
  }, [sosCountdown]);

  const handleSearch = async () => {
    try { const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`); setResults(res.data); } catch(e){}
  };

  const startTrip = async () => {
    if(!dest) return alert("Select Dest");
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/api/trips/start`, { destination: { name: dest.display_name, lat: dest.lat, lon: dest.lon } }, { headers: { 'x-auth-token': token } });
    
    setTripDetails(res.data);
    setIsActive(true);
    if (safeCheckInterval) setSafeCheckSeconds(parseFloat(safeCheckInterval) * 60);

    socketRef.current.emit('joinTripRoom', res.data._id);
    watchIdRef.current = navigator.geolocation.watchPosition(p => {
         const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
         setUserPos(coords);
         socketRef.current.emit('updateLocation', { tripId: res.data._id, coordinates: coords });
    });
  };

  // --- SOS LOGIC ---
  const triggerSOSSequence = () => {
      setSosCountdown(5); // Start the overlay countdown
  };

  const sendSOS = async () => {
      alert("🚨 SENDING SOS TO FAMILY!");
      // 1. Socket Signal (Triggers Red Marker on Tracking Page)
      socketRef.current.emit('sosTriggered', tripDetails._id);
      
      // 2. DB Update
      const token = localStorage.getItem('token');
      try {
          await axios.post(`${API_URL}/api/trips/${tripDetails._id}/sos`, { lat: userPos.lat, lng: userPos.lng }, { headers: { 'x-auth-token': token } });
      } catch(e) {}
      
      // 3. Open WhatsApp (for manual send)
      contacts.forEach(c => {
         const link = `${window.location.origin}/track/${tripDetails._id}`;
         const msg = `🚨 SOS! I NEED HELP! Track me: ${link}`;
         window.open(`https://api.whatsapp.com/send?phone=${c.phone.replace(/\D/g,'')}&text=${encodeURIComponent(msg)}`, '_blank');
      });
  };

  // --- I'M SAFE LOGIC ---
  const handleImSafe = async () => {
      // 1. Reset timer
      if (safeCheckInterval) setSafeCheckSeconds(parseFloat(safeCheckInterval) * 60);
      
      // 2. Cancel SOS on Server
      socketRef.current.emit('sosCancelled', tripDetails._id);
      const token = localStorage.getItem('token');
      try {
          await axios.post(`${API_URL}/api/trips/${tripDetails._id}/safe`, {}, { headers: { 'x-auth-token': token } });
      } catch(e) {}
      alert("Status updated to SAFE.");
  };

  const endTrip = async () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socketRef.current.emit('endTrip', tripDetails._id);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/trips/${tripDetails._id}/end`, {}, { headers: { 'x-auth-token': token } });
      setIsActive(false); setTripDetails(null); setDest(null); setResults([]);
      alert("Trip ended.");
  };

  return (
    <div className="dashboard-layout">
      <DashboardStyles />
      <div className="map-column"><MapView userPosition={userPos} destination={dest} /></div>
      <div className="controls-column">
        {isActive ? (
          <TripStatusPanel 
             tripDetails={tripDetails} 
             onEndTrip={endTrip} 
             contacts={contacts} 
             onTriggerSOS={triggerSOSSequence}
             safeCheckSeconds={safeCheckSeconds}
             handleImSafe={handleImSafe}
          />
        ) : (
          <BeforeTripPanel
            contacts={contacts} loading={false} searchTerm={searchTerm}
            setSearchTerm={setSearchTerm} onSearch={handleSearch} results={results}
            onSelectDest={setDest} dest={dest} onStart={startTrip} 
            setSafeCheckInterval={setSafeCheckInterval}
          />
        )}
      </div>

      {/* SOS COUNTDOWN OVERLAY */}
      {sosCountdown !== null && (
          <div className="sos-countdown-overlay">
              <h1>SENDING SOS IN...</h1>
              <div className="countdown-number">{sosCountdown}</div>
              <button className="btn-cancel-sos" onClick={() => setSosCountdown(null)}>CANCEL - I'M SAFE</button>
          </div>
      )}
    </div>
  );
};
export default Dashboard;












