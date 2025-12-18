import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

// --- CONFIG ---
const API_URL = 'http://172.18.24.204:5000'; // Your IP

// --- STYLES ---
const DashboardStyles = () => (
  <style>{`
    .dashboard-layout { display: flex; height: calc(100vh - 70px); background-color: #f3f4f6; position: relative; }
    .map-column { flex: 3; background-color: #e5e7eb; position: relative; }
    .controls-column { flex: 2; background-color: #ffffff; padding: 1.5rem 2rem; display: flex; flex-direction: column; overflow-y: hidden; }
    .panel-container { display: flex; flex-direction: column; height: 100%; position: relative; }
    
    /* SOS Button */
    .sos-btn-floating { position: absolute; bottom: 30px; right: 30px; width: 80px; height: 80px; background: radial-gradient(circle, #ff4d4d 0%, #cc0000 100%); border: 4px solid white; border-radius: 50%; color: white; font-weight: bold; font-size: 1.2rem; box-shadow: 0 4px 15px rgba(255, 0, 0, 0.4); cursor: pointer; z-index: 1000; animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); } 70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(255, 0, 0, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); } }

    /* SOS Countdown Overlay */
    .sos-countdown-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(200, 0, 0, 0.9); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; }
    .countdown-number { font-size: 8rem; font-weight: bold; margin: 20px 0; }
    .btn-cancel-sos { background: white; color: #cc0000; padding: 15px 30px; font-size: 1.5rem; font-weight: bold; border: none; border-radius: 50px; cursor: pointer; }

    /* Safe Check */
    .safe-check-box { background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
    .safe-timer { font-size: 1.5rem; font-weight: bold; color: #856404; display: block; margin: 10px 0; }
    .btn-im-safe { background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; }

    /* UI Basics */
    .destination-form label { font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; }
    .search-input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .search-input-group input { flex-grow: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; }
    .search-input-group button { background: linear-gradient(90deg, #b8369a, #6a11cb); color: white; border: none; border-radius: 8px; padding: 0 1rem; cursor: pointer; }
    .results-list li { padding: 8px; cursor: pointer; border-bottom: 1px solid #eee; }
    .results-list li:hover { background: #f0f9ff; }
    .start-trip-button { width: 100%; padding: 1rem; margin-top: 1rem; background: linear-gradient(90deg, #b669a4, #8d5ec1); color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .start-trip-button:disabled { background: #c4b5fd; cursor: not-allowed; }
    
    .timer-display { text-align: center; margin: 2rem 0; }
    .timer-display span { font-size: 3rem; font-weight: bold; color: #111; }
    .trip-actions { display: flex; gap: 1rem; margin-top: auto; }
    .share-button { flex: 1; padding: 1rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
    .end-trip-button { flex: 1; padding: 1rem; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
  `}</style>
);

// --- LOADERS ---
const loadLeaflet = (cb) => {
  if (window.L) return cb();
  const c = document.createElement('link'); c.rel='stylesheet'; c.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
  const s = document.createElement('script'); s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload=cb; document.head.appendChild(s);
};

// --- MAP VIEW ---
const MapView = ({ userPosition, destination }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    loadLeaflet(() => {
      if (window.L && mapContainerRef.current && !mapInstanceRef.current) {
        try {
            const L = window.L;
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
            
            const lat = parseFloat(userPosition?.lat) || 26.76;
            const lng = parseFloat(userPosition?.lng) || 83.37;
            
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
            userMarkerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
        } catch (e) { console.error("Map Error", e); }
      }
    });
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      const L = window.L;
      try {
        const uLat = parseFloat(userPosition?.lat);
        const uLng = parseFloat(userPosition?.lng);
        
        if (!isNaN(uLat) && !isNaN(uLng) && userMarkerRef.current) {
             userMarkerRef.current.setLatLng([uLat, uLng]);
             // Optional: center map on user periodically
             // mapInstanceRef.current.panTo([uLat, uLng]);
        }

        if (destination && destination.lat) {
           const dLat = parseFloat(destination.lat);
           const dLng = parseFloat(destination.lon);
           if (!isNaN(dLat)) {
                if (!destMarkerRef.current) destMarkerRef.current = L.marker([dLat, dLng]).addTo(mapInstanceRef.current);
                else destMarkerRef.current.setLatLng([dLat, dLng]);
                
                const path = [[uLat, uLng], [dLat, dLng]];
                if (!polylineRef.current) polylineRef.current = L.polyline(path, {color:'#4f46e5'}).addTo(mapInstanceRef.current);
                else polylineRef.current.setLatLngs(path);
           }
        }
      } catch (e) { console.error(e); }
    }
  }, [userPosition, destination]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

// --- BEFORE TRIP PANEL ---
const BeforeTripPanel = ({ contacts, searchTerm, setSearchTerm, onSearch, results, onSelectDest, dest, onStart, setSafeCheckInterval }) => (
    <div className="panel-container">
        <h3>Start Trip</h3>
        <div className="search-input-group">
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Destination..." />
            <button onClick={onSearch}>Search</button>
        </div>
        <ul className="results-list">
            {results.slice(0, 3).map(r => (
                <li key={r.place_id} onClick={() => onSelectDest({lat: r.lat, lon: r.lon, display_name: r.display_name})} style={{background: dest?.place_id === r.place_id ? '#e0e7ff':''}}>{r.display_name}</li>
            ))}
        </ul>
        <div style={{margin: '15px 0'}}>
            <label>Safe Check (Auto SOS):</label>
            <select style={{width:'100%', padding:'10px'}} onChange={(e) => setSafeCheckInterval(e.target.value)}>
                <option value="">Off</option>
                <option value="0.2">10 Seconds (Test)</option>
                <option value="1">1 Minute</option>
                <option value="15">15 Minutes</option>
            </select>
        </div>
        <button className="start-trip-button" onClick={onStart} disabled={!dest}>Start SafeWalk</button>
        <div style={{marginTop:'10px'}}><h4>Contacts</h4>{contacts.map(c=><div key={c._id}>👤 {c.name}</div>)}</div>
    </div>
);

// --- TRIP STATUS PANEL ---
const TripStatusPanel = ({ tripDetails, onEndTrip, contacts, onTriggerSOS, safeCheckSeconds, resetSafeCheck }) => {
    const [time, setTime] = useState(0);
    
    useEffect(() => {
        if(!tripDetails) return;
        const i = setInterval(() => setTime(Math.floor((new Date() - new Date(tripDetails.startedAt)) / 1000)), 1000);
        return () => clearInterval(i);
    }, [tripDetails]);

    const format = (s) => new Date(s * 1000).toISOString().substr(11, 8);

    const handleShare = (contact) => {
        const link = `${window.location.origin}/track/${tripDetails._id}`;
        window.open(`https://api.whatsapp.com/send?phone=${contact.phone.replace(/\D/g,'')}&text=${encodeURIComponent(`🚨 Tracking Link: ${link}`)}`, '_blank');
    };

    return (
        <div className="panel-container">
            <h3 className="status-title">Trip in Progress</h3>
            
            {safeCheckSeconds !== null && (
                <div className="safe-check-box">
                    <small>SAFE CHECK IN</small>
                    <span className="safe-timer" style={{color: safeCheckSeconds < 10 ? 'red' : 'inherit'}}>
                        {Math.floor(safeCheckSeconds / 60)}:{String(safeCheckSeconds % 60).padStart(2,'0')}
                    </span>
                    <button className="btn-im-safe" onClick={resetSafeCheck}>I'm Safe</button>
                </div>
            )}

            <div className="timer-display"><p>DURATION</p><span>{format(time)}</span></div>
            
            <div className="trip-actions">
               {contacts.map(c => <button key={c._id} className="share-button" onClick={() => handleShare(c)}>Share {c.name}</button>)}
               <button className="end-trip-button" onClick={onEndTrip}>End</button>
            </div>
            
            {/* Start Countdown Logic */}
            <button className="sos-btn-floating" onClick={onTriggerSOS}>SOS</button>
        </div>
    );
};

// --- DASHBOARD ---
const Dashboard = () => {
  const [isActive, setIsActive] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [dest, setDest] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [userPos, setUserPos] = useState({ lat: 26.76, lng: 83.37 });
  const [safeCheckInterval, setSafeCheckInterval] = useState(null);
  const [safeCheckSeconds, setSafeCheckSeconds] = useState(null);
  
  // SOS State
  const [sosCountdown, setSosCountdown] = useState(null); // If not null, countdown is active

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(API_URL);
    navigator.geolocation.getCurrentPosition(p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }));
    const token = localStorage.getItem('token');
    if(!token) { navigate('/login'); return; }
    axios.get(`${API_URL}/api/contacts`, { headers: { 'x-auth-token': token } }).then(res => setContacts(res.data));
    return () => socketRef.current.disconnect();
  }, [navigate]);

  // Safe Check Logic
  useEffect(() => {
      let t;
      if (isActive && safeCheckSeconds !== null && sosCountdown === null) {
          t = setInterval(() => {
              setSafeCheckSeconds(prev => {
                  if (prev <= 1) {
                      triggerSOSSequence(); // Start 5s countdown
                      return parseInt(safeCheckInterval) * 60; // Reset safe check
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(t);
  }, [isActive, safeCheckSeconds, sosCountdown]);

  // SOS Countdown Logic
  useEffect(() => {
      let t;
      if (sosCountdown !== null) {
          if (sosCountdown > 0) {
              t = setInterval(() => setSosCountdown(prev => prev - 1), 1000);
          } else {
              // COUNTDOWN HIT 0: SEND ALERT
              sendSOSAlert();
              setSosCountdown(null); // Close overlay
          }
      }
      return () => clearInterval(t);
  }, [sosCountdown]);

  const triggerSOSSequence = () => {
      setSosCountdown(5); // Start 5 second countdown
  };

  const sendSOSAlert = async () => {
      // 1. Socket
      socketRef.current.emit('sosTriggered', tripDetails._id);
      
      // 2. DB
      const token = localStorage.getItem('token');
      try {
          await axios.post(`${API_URL}/api/trips/${tripDetails._id}/sos`, { lat: userPos.lat, lng: userPos.lng }, { headers: { 'x-auth-token': token } });
      } catch(e) {}

      // 3. WhatsApp for ALL contacts
      contacts.forEach(c => {
         const link = `${window.location.origin}/track/${tripDetails._id}`;
         const msg = `🚨 SOS! I NEED HELP! Track me: ${link}`;
         window.open(`https://api.whatsapp.com/send?phone=${c.phone.replace(/\D/g,'')}&text=${encodeURIComponent(msg)}`, '_blank');
      });
  };

  const startTrip = async () => {
    if(!dest) return alert("Select Dest");
    const token = localStorage.getItem('token');
    try {
        const res = await axios.post(`${API_URL}/api/trips/start`, { destination: { name: dest.display_name, lat: dest.lat, lon: dest.lon } }, { headers: { 'x-auth-token': token } });
        setTripDetails(res.data);
        setIsActive(true);
        if (safeCheckInterval) setSafeCheckSeconds(parseInt(safeCheckInterval) * 60);
        
        socketRef.current.emit('joinTripRoom', res.data._id);
        watchIdRef.current = navigator.geolocation.watchPosition(p => {
             const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
             setUserPos(coords);
             socketRef.current.emit('updateLocation', { tripId: res.data._id, coordinates: coords });
        });
    } catch(e) {}
  };

  const endTrip = async () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socketRef.current.emit('endTrip', tripDetails._id);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/trips/${tripDetails._id}/end`, {}, { headers: { 'x-auth-token': token } });
      setIsActive(false); setTripDetails(null); setDest(null); setResults([]);
  };

  const handleSearch = async () => {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`);
      setResults(res.data);
  }

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
             onTriggerSOS={triggerSOSSequence} // Trigger countdown
             safeCheckSeconds={safeCheckSeconds}
             resetSafeCheck={() => setSafeCheckSeconds(parseInt(safeCheckInterval) * 60)}
          />
        ) : (
          <BeforeTripPanel contacts={contacts} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onSearch={handleSearch} results={results} onSelectDest={setDest} dest={dest} onStart={startTrip} setSafeCheckInterval={setSafeCheckInterval} />
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