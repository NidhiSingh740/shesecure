// server/models/Trip.js

const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Status tracks the state: active, completed, or sos
  status: { type: String, default: 'active', enum: ['active', 'completed', 'sos'] },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  path: [
    {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  destination: {
    name: String,
    lat: String,
    lon: String,
  },
  // Store history of alerts
  sosAlerts: [
    {
      timestamp: { type: Date, default: Date.now },
      location: { lat: Number, lng: Number }
    }
  ]
});

module.exports = mongoose.model('Trip', TripSchema);