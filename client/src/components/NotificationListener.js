
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

// --- STYLES (Self-Contained) ---
const NotificationStyles = () => (
  <style>{`
    .notification-popup {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #ffffff;
      border-left: 5px solid #e74c3c; /* Red border for urgency */
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 9999;
      animation: slideIn 0.5s ease-out;
      max-width: 350px;
      font-family: sans-serif;
    }
    .notification-header { font-weight: bold; color: #e74c3c; margin-bottom: 5px; font-size: 1.1rem; }
    .notification-body { color: #333; margin-bottom: 15px; font-size: 0.95rem; }
    .track-btn {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
      margin-bottom: 5px;
    }
    .track-btn:hover { background-color: #c0392b; }
    .dismiss-btn {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      width: 100%;
      font-size: 0.8rem;
    }
    .dismiss-btn:hover { text-decoration: underline; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `}</style>
);

const NotificationListener = () => {
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Connect to socket
    const socket = io('172.18.24.204:5000');

    // 2. Listen for the 'receiveNotification' event from the server
    socket.on('receiveNotification', (data) => {
      // Play a sound (optional, might be blocked by browsers until interaction)
      try {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => console.log("Audio play failed (user interaction needed)"));
      } catch (e) {}
      
      setNotification(data);
    });

    return () => socket.disconnect();
  }, []);

  const handleTrackClick = () => {
    if (notification) {
      navigate(`/track/${notification.tripId}`);
      setNotification(null); // Clear notification after clicking
    }
  };

  if (!notification) return null;

  return (
    <>
      <NotificationStyles />
      <div className="notification-popup">
        <div className="notification-header">⚠️ SAFETY ALERT</div>
        <div className="notification-body">
          {notification.message}
        </div>
        <button className="track-btn" onClick={handleTrackClick}>
          TRACK LIVE LOCATION
        </button>
        <button className="dismiss-btn" onClick={() => setNotification(null)}>
            Dismiss
        </button>
      </div>
    </>
  );
};

export default NotificationListener;