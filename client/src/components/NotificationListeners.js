
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://172.18.24.167:5000'; // Your IP

const NotificationStyles = () => (
  <style>{`
    .notification-popup {
      position: fixed; top: 20px; right: 20px; background: white; 
      border-left: 5px solid #ef4444; padding: 15px; border-radius: 8px; 
      box-shadow: 0 5px 15px rgba(0,0,0,0.2); z-index: 2000; width: 300px; 
      animation: slideIn 0.5s ease-out; font-family: sans-serif;
    }
    .notif-btn { background: #ef4444; color: white; border: none; padding: 8px; width: 100%; margin-top: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `}</style>
);

const NotificationListener = () => {
  const [alertData, setAlertData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(API_URL);
    socket.on('receiveNotification', (data) => {
      console.log("ALERT:", data);
      try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(()=>{}); } catch(e){}
      setAlertData(data);
    });
    return () => socket.disconnect();
  }, []);

  if (!alertData) return null;

  return (
    <>
      <NotificationStyles />
      <div className="notification-popup">
        <div style={{color: '#ef4444', fontWeight: 'bold', marginBottom: '5px'}}>⚠️ SAFETY ALERT</div>
        <div>{alertData.message}</div>
        <button className="notif-btn" onClick={() => { navigate(`/track/${alertData.tripId}`); setAlertData(null); }}>TRACK LIVE LOCATION</button>
        <button onClick={() => setAlertData(null)} style={{background:'none', border:'none', width:'100%', marginTop:'5px', color:'#666', cursor:'pointer'}}>Dismiss</button>
      </div>
    </>
  );
};
export default NotificationListener;