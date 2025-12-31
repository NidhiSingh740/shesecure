//erver/ models/Incident.js
const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['harassment', 'lighting', 'accident', 'theft', 'other'] 
  },
  description: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', IncidentSchema);