import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://172.18.24.111:5000'; // Your IP

const MapStyles = () => (
  <style>{`
    .community-container { display: flex; height: calc(100vh - 70px); position: relative; }
    .map-full { flex: 1; z-index: 1; }
    .report-btn-float { position: absolute; bottom: 30px; right: 30px; background: #dc3545; color: white; padding: 15px 30px; border-radius: 50px; font-weight: bold; border: none; cursor: pointer; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-size: 1.1rem; }
    .report-modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 2000; width: 300px; }
    .report-modal h3 { margin-top: 0; color: #333; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #555; }
    .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    .btn-submit { background: #dc3545; color: white; border: none; padding: 10px; width: 100%; border-radius: 4px; cursor: pointer; font-weight: bold; }
    .btn-cancel { background: #eee; color: #333; border: none; padding: 10px; width: 100%; border-radius: 4px; cursor: pointer; margin-top: 10px; }
    .instruction-banner { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px; z-index: 1000; font-weight: bold; }
  `}</style>
);

const loadLeaflet = (cb) => {
    if (window.L) return cb();
    const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = cb; document.head.appendChild(s);
    const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
};

const CommunityMap = () => {
    const [incidents, setIncidents] = useState([]);
    const [reportMode, setReportMode] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newCoords, setNewCoords] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    
    // Form State
    const [type, setType] = useState('harassment');
    const [desc, setDesc] = useState('');

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);

    // 1. Get User ID from Token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Decode token to get user ID payload
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                setCurrentUserId(payload.user.id);
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
    }, []);

    // 2. Fetch Incidents & Setup Delete Handler
    useEffect(() => {
        const fetchIncidents = () => {
            axios.get(`${API_URL}/api/incidents`).then(res => setIncidents(res.data)).catch(console.error);
        };
        fetchIncidents();

        // ** Global function for popup button to call **
        window.handleDeleteIncident = async (id) => {
            const token = localStorage.getItem('token');
            if(!token || !window.confirm("Are you sure you want to delete this report?")) return;
            
            try {
                await axios.delete(`${API_URL}/api/incidents/${id}`, { headers: { 'x-auth-token': token } });
                alert("Report deleted.");
                fetchIncidents(); // Refresh map
            } catch(e) {
                alert("Failed to delete. You might not be the owner.");
            }
        };

        loadLeaflet(() => {
            if(window.L && mapRef.current && !mapInstance.current) {
                const L = window.L;
                const map = L.map(mapRef.current).setView([26.7606, 83.3732], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                mapInstance.current = map;

                map.on('click', (e) => {
                    if (window.reportModeActive) { 
                        setNewCoords(e.latlng);
                        setShowForm(true);
                        setReportMode(false);
                        window.reportModeActive = false;
                    }
                });
            }
        });
    }, []);

    // 3. Update Markers
    useEffect(() => {
        if(mapInstance.current && window.L) {
            const L = window.L;
            
            // Clear old markers
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];

            incidents.forEach(inc => {
                let colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
                if (inc.type === 'lighting') colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png';
                
                const icon = new L.Icon({
                    iconUrl: colorUrl,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
                });
                
                // ** LOGIC: If I own this report, show Delete button **
                const isOwner = currentUserId === inc.userId;
                const deleteBtn = isOwner ? `<br><button onclick="window.handleDeleteIncident('${inc._id}')" style="background:#dc3545; color:white; border:none; border-radius:4px; padding:5px 10px; margin-top:5px; cursor:pointer; width:100%;">Delete</button>` : '';

                const marker = L.marker([inc.location.lat, inc.location.lng], {icon})
                 .addTo(mapInstance.current)
                 .bindPopup(`
                    <div style="font-family:sans-serif;">
                        <b style="text-transform:uppercase; color:#333;">${inc.type}</b>
                        <p style="margin:5px 0;">${inc.description}</p>
                        <small style="color:#666;">${new Date(inc.timestamp).toLocaleDateString()}</small>
                        ${deleteBtn}
                    </div>
                 `);
                
                markersRef.current.push(marker);
            });
        }
    }, [incidents, currentUserId]);

    const enableReportMode = () => {
        setReportMode(true);
        window.reportModeActive = true; 
    };

    const submitReport = async () => {
        const token = localStorage.getItem('token');
        if(!token) return alert("Login required");
        try {
            await axios.post(`${API_URL}/api/incidents`, {
                type, description: desc, lat: newCoords.lat, lng: newCoords.lng
            }, { headers: { 'x-auth-token': token } });
            
            setShowForm(false); setDesc(''); alert("Report Submitted!");
            // Refresh list
            const res = await axios.get(`${API_URL}/api/incidents`);
            setIncidents(res.data);
        } catch(e) { alert("Failed to submit"); }
    };

    return (
        <div className="community-container">
            <MapStyles />
            {reportMode && <div className="instruction-banner">Click on the map location to report incident</div>}
            
            <div ref={mapRef} className="map-full"></div>
            
            {!showForm && <button className="report-btn-float" onClick={enableReportMode}>⚠️ Report Incident</button>}

            {showForm && (
                <div className="report-modal">
                    <h3>Report Unsafe Area</h3>
                    <div className="form-group">
                        <label>Type</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option value="harassment">Harassment</option>
                            <option value="lighting">Poor Lighting</option>
                            <option value="theft">Theft/Snatching</option>
                            <option value="accident">Accident Prone</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows="3" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe what happened..."></textarea>
                    </div>
                    <button className="btn-submit" onClick={submitReport}>Submit Report</button>
                    <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};
export default CommunityMap;