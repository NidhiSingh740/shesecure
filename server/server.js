const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const tripRoutes = require('./routes/trips');
const incidentRoutes = require('./routes/incidents');
const zoneRoutes = require('./routes/zones'); // Import Zones
const Trip = require('./models/Trip');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://172.18.24.116:3000", "*"],
    methods: ["GET", "POST", "PUT"]
  }
});

app.use(cors());
app.use(express.json());

const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/zones', zoneRoutes); // Use Zones

// --- SOCKET LOGIC ---
io.on('connection', (socket) => {
  socket.on('joinTripRoom', (tripId) => socket.join(tripId));
  
  socket.on('updateLocation', async ({ tripId, coordinates }) => {
    io.to(tripId).emit('tripUpdate', coordinates);
    try { await Trip.findByIdAndUpdate(tripId, { $push: { path: { lat: coordinates.lat, lng: coordinates.lng } } }); } catch (e) {}
  });

  socket.on('endTrip', (tripId) => io.to(tripId).emit('tripEnded'));
  
  socket.on('sosTriggered', (tripId) => {
      console.log(`🚨 SOS: ${tripId}`);
      io.to(tripId).emit('sosAlert'); 
  });

  socket.on('sosCancelled', (tripId) => io.to(tripId).emit('sosClear'));

  // --- NOTIFICATION LOGIC ---
  socket.on('zoneAlert', ({ tripId, message, type }) => {
      // Relay "Arrived at Home" to contacts
      io.to(tripId).emit('receiveZoneAlert', { message, type });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));