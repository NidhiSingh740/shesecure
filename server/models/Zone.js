const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Safe', 'Danger'], required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  radius: { type: Number, default: 200 },
  activeStart: String,
  activeEnd: String
}, { timestamps: true });

module.exports = mongoose.model('Zone', ZoneSchema);