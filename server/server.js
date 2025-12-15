const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Required for Socket.IO
const { Server } = require("socket.io"); // Required for Socket.IO

// Route imports
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const tripRoutes = require('./routes/trips'); // Import the new trip routes

// Model imports for Socket.IO logic
const Trip = require('./models/Trip');

const app = express();
const server = http.createServer(app); // Create an HTTP server from the Express app

// Initialize Socket.IO and attach it to the server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app's address
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch((err) => console.error('❌ Database connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/trips', tripRoutes); // Use the new trip routes

// --- Socket.IO Real-Time Logic ---
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // When a user starts a trip, they should join a room for that trip
  socket.on('joinTripRoom', (tripId) => {
    socket.join(tripId);
    console.log(`User ${socket.id} joined room ${tripId}`);
  });

  // Listen for location updates from the user on a trip
  socket.on('updateLocation', async ({ tripId, coordinates }) => {
    try {
      const trip = await Trip.findById(tripId);
      if (trip && trip.isActive) {
        // Add the new location to the path
        trip.path.push({ lat: coordinates.lat, lng: coordinates.lng });
        await trip.save();

        // Broadcast the new location to everyone in the trip room (i.e., trusted contacts)
        io.to(tripId).emit('tripUpdate', coordinates);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  });

  // Listen for trip end from the traveler
  socket.on('endTrip', async ({ tripId }) => {
    try {
      const trip = await Trip.findById(tripId);
      if (trip) {
        trip.isActive = false;
        trip.endedAt = new Date();
        await trip.save();

        // Notify everyone in the trip room that the trip has ended
        io.to(tripId).emit('tripEnded', { tripId });
        console.log(`🛑 Trip ${tripId} ended and all trackers notified`);
      }
    } catch (error) {
      console.error('Error ending trip:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔥 A user disconnected:', socket.id);
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // Use server.listen instead of app.listen
  console.log(`✅ Backend server with Socket.IO is running on port ${PORT}`);
});

