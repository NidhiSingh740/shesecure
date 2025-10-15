
const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // The path will store an array of coordinate points
  path: [
    {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  // You can store destination details here if needed
  destination: {
    name: String,
    lat: Number,
    lng: Number,
  }
});

module.exports = mongoose.model('Trip', TripSchema);
