import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// --- STYLES (Self-Contained for Stability) ---
const DashboardStyles = () => (
  <style>{`
    /* --- Main Layout --- */
    .dashboard-layout { display: flex; height: calc(100vh - 70px); background-color: #f3f4f6; }
    .map-column { flex: 3; background-color: #e5e7eb; }
    .controls-column { flex: 2; background-color: #ffffff; padding: 1.5rem 2rem; box-shadow: -5px 0 15px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; overflow-y: hidden; }

    /* --- Universal Panel Styles --- */
    .panel-container { display: flex; flex-direction: column; height: 100%; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem; }
    .panel-header h3 { margin: 0; font-size: 1.25rem; color: #111827; }

    /* --- Trip Planning Module --- */
    .trip-planning-module { flex-shrink: 0; }
    .destination-form label { font-weight: 600; color: #374151; display: block; margin-bottom: 0.5rem; }
    .search-input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .search-input-group input { flex-grow: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
    .search-input-group button { background: linear-gradient(90deg, #b8369a, #6a11cb); color: white; border: none; border-radius: 8px; padding: 0 1rem; cursor: pointer; }
    .results-section { margin-bottom: 1rem; max-height: 150px; overflow-y: auto; }
    .results-list { list-style: none; padding: 0; margin: 0; border: 1px solid #e5e7eb; border-radius: 8px; }
    .results-list li { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; cursor: pointer; font-size: 0.9rem; }
    .results-list li.selected { background-color: #e0e7ff; font-weight: bold; }
    .start-trip-button { width: 100%; padding: 1rem; margin-top: 1rem; font-size: 1.1rem; font-weight: bold; color: white; background: linear-gradient(90deg, #b669a4, #8d5ec1); border: none; border-radius: 8px; cursor: pointer; }
    .start-trip-button:disabled { background: #c4b5fd; cursor: not-allowed; }
    .search-error, .error-text { color: #ef4444; }

    /* --- Contacts Module --- */
    .contacts-module { flex-grow: 1; margin-top: 2rem; overflow-y: auto; }
    .manage-link { text-decoration: none; color: #4f46e5; font-weight: 600; }
    .contact-item { display: flex; align-items: center; padding: 0.75rem 0; gap: 1rem; }
    .contact-avatar { width: 40px; height: 40px; border-radius: 50%; background-color: #e0e7ff; color: #4338ca; display: grid; place-items: center; font-weight: bold; }
    .contact-details { display: flex; flex-direction: column; }

    /* --- Trip Status Panel --- */
    .status-title { text-align: center; font-size: 1.5rem; }
    .timer-display { text-align: center; margin: auto; }
    .timer-display p { margin: 0; color: #6b7280; }
    .timer-display span { font-size: 4rem; font-weight: bold; }
    .trip-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .share-button, .end-trip-button { flex: 1; padding: 1rem; font-size: 1rem; font-weight: bold; border-radius: 8px; cursor: pointer; border: none; }
    .end-trip-button { background-color: #ef4444; color: white; }
  `}</style>
);

// --- DYNAMIC SCRIPT LOADERS (Most Robust Method) ---
const loadLeafletCSS = () => {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
};

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


// --- SUB-COMPONENTS (Defined inside the main file for stability) ---

const MapView = ({ userPosition, destination }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  useEffect(() => {
    if (mapContainerRef.current && window.L) {
      const L = window.L;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current).setView([userPosition.lat, userPosition.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);
      }
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng]).addTo(mapInstanceRef.current);
      } else {
        userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
      }
      if (destination) {
        if (!destMarkerRef.current) {
          destMarkerRef.current = L.marker([destination.lat, destination.lon]).addTo(mapInstanceRef.current);
        } else {
          destMarkerRef.current.setLatLng([destination.lat, destination.lon]);
        }
      } else if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
      if (destination) {
        const latlngs = [[userPosition.lat, userPosition.lng], [destination.lat, destination.lon]];
        if (!polylineRef.current) {
          polylineRef.current = L.polyline(latlngs, { color: '#4f46e5' }).addTo(mapInstanceRef.current);
        } else {
          polylineRef.current.setLatLngs(latlngs);
        }
        mapInstanceRef.current.fitBounds(latlngs, { padding: [50, 50] });
      } else if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
        mapInstanceRef.current.setView([userPosition.lat, userPosition.lng], 13);
      }
    }
  }, [userPosition, destination]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />;
};

const BeforeTripPanel = ({ contacts, loading, contactsError, searchTerm, setSearchTerm, onSearch, isSearching, searchResults, onSelectDestination, selectedDestination, onStartTrip, searchError }) => (
    <div className="panel-container">
        <div className="trip-planning-module">
          <h3>Start a New Trip</h3>
          <div className="destination-form">
            <label>Where are you going?</label>
            <div className="search-input-group">
              <input type="text" placeholder="Search for a destination..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && onSearch()} />
              <button onClick={onSearch} disabled={isSearching}>{isSearching ? '...' : 'Search'}</button>
            </div>
            {searchError && <p className="search-error">{searchError}</p>}
            {searchResults.length > 0 && (
              <div className="results-section">
                <ul className="results-list">
                  {searchResults.slice(0, 7).map((result) => (
                    <li key={result.place_id} className={selectedDestination?.place_id === result.place_id ? 'selected' : ''} onClick={() => onSelectDestination(result)}>
                      {result.display_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button className="start-trip-button" onClick={onStartTrip} disabled={!selectedDestination}>Start SafeWalk Trip</button>
          </div>
        </div>
        <div className="contacts-module">
          <div className="panel-header">
            <h3>Trusted Contacts</h3>
            <Link to="/contacts" className="manage-link">Manage</Link>
          </div>
          <div className="contact-list">
            {loading && <p>Loading contacts...</p>}
            {contactsError && <p className="error-text">{contactsError}</p>}
            {!loading && !contactsError && contacts.map(contact => (
              <div key={contact._id} className="contact-item">
                <div className="contact-avatar">{contact.name.charAt(0)}</div>
                <div className="contact-details">
                  <strong>{contact.name}</strong>
                  <span>{contact.phone}</span>
                </div>
              </div>
            ))}
            {!loading && !contactsError && contacts.length === 0 && <p>No contacts added yet.</p>}
          </div>
        </div>
    </div>
);
const TripStatusPanel = ({ tripDetails, onEndTrip }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Math.floor((new Date() - tripDetails.startTime) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [tripDetails]);

    const formatTime = (totalSeconds) => {
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="panel-container">
            <h3 className="status-title">Trip in Progress</h3>
            <div className="timer-display"><p>ELAPSED TIME</p><span>{formatTime(elapsedTime)}</span></div>
            <div className="trip-actions"><button className="share-button">Share Link</button><button className="end-trip-button" onClick={onEndTrip}>End Trip</button></div>
        </div>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = () => {
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [isTripActive, setIsTripActive] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactsError, setContactsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [tripDetails, setTripDetails] = useState(null);
  const [userPosition, setUserPosition] = useState({ lat: 26.7606, lng: 83.3732 });
  const [searchError, setSearchError] = useState('');
  
  // Effect to load Leaflet CSS and JS
  useEffect(() => {
    loadLeafletCSS();
    loadLeafletScript(() => setIsLeafletReady(true));
  }, []);

  // Effect to get user's location and fetch contacts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => setUserPosition({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setContactsError("Could not get user's location.")
    );

    const fetchContacts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authorization failed.');
        const res = await axios.get('http://localhost:5000/api/contacts', {
          headers: { 'x-auth-token': token },
        });
        setContacts(res.data);
      } catch (err) {
        setContactsError('Could not load contacts.');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // --- THIS IS THE CORRECT, FULLY IMPLEMENTED SEARCH LOGIC ---
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setSearchError('');
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}`);
      if (response.data.length === 0) {
        setSearchError('No results found for that location.');
      }
      setSearchResults(response.data);
    } catch (err) {
      setSearchError('Search failed. Please check your network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  // --- THIS IS THE CORRECT, FULLY IMPLEMENTED START TRIP LOGIC ---
  const handleStartTrip = () => {
    if (!selectedDestination) {
      alert("Please select a destination from the search results first.");
      return;
    }
    const newTrip = { id: `trip_${new Date().getTime()}`, startTime: new Date(), destination: selectedDestination };
    setTripDetails(newTrip);
    setIsTripActive(true);
    alert("Your SafeWalk trip has started.");
  };

  // --- THIS IS THE CORRECT, FULLY IMPLEMENTED END TRIP LOGIC ---
  const handleEndTrip = () => {
    setIsTripActive(false);
    setTripDetails(null);
    setSelectedDestination(null);
    setSearchTerm('');
    setSearchResults([]);
    alert("Your trip has safely ended.");
  };

  return (
    <>
      <DashboardStyles />
      <div className="dashboard-layout">
        <div className="map-column">
          {isLeafletReady ? (
             <MapView userPosition={userPosition} destination={selectedDestination} />
          ) : (
            <p style={{textAlign: 'center', paddingTop: '2rem'}}>Loading Map Library...</p>
          )}
        </div>
        <div className="controls-column">
          {isTripActive ? (
            <TripStatusPanel tripDetails={tripDetails} onEndTrip={handleEndTrip} />
          ) : (
            <BeforeTripPanel
              contacts={contacts}
              loading={loading}
              contactsError={contactsError}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
              isSearching={isSearching}
              searchResults={searchResults}
              onSelectDestination={setSelectedDestination}
              selectedDestination={selectedDestination}
              onStartTrip={handleStartTrip}
              searchError={searchError}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;

