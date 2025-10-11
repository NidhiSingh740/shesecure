import React, { useState, useEffect } from 'react';

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

  const handleShare = () => {
    const shareableLink = `https://your-domain.com/track/${tripDetails.id}`;
    navigator.clipboard.writeText(shareableLink);
    alert(`Trip link copied to clipboard!\n${shareableLink}`);
  };

  return (
    <div className="panel-container">
      <h3 className="status-title">Trip in Progress</h3>
      <div className="timer-display">
        <p>ELAPSED TIME</p>
        <span>{formatTime(elapsedTime)}</span>
      </div>
      <div className="trip-actions">
        <button className="share-button" onClick={handleShare}>Share Link</button>
        <button className="end-trip-button" onClick={onEndTrip}>End Trip</button>
      </div>
    </div>
  );
};

export default TripStatusPanel;

