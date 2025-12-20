const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const tripRoutes = require('./routes/trips');
const Trip = require('./models/Trip');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Allow connections from your specific IP and localhost
    origin: ["http://localhost:3000", "http://172.18.24.204:3000", "*"],
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

io.on('connection', (socket) => {
  // 1. Join Room
  socket.on('joinTripRoom', (tripId) => {
    socket.join(tripId);
  });

  // 2. Update Location
  socket.on('updateLocation', async ({ tripId, coordinates }) => {
    io.to(tripId).emit('tripUpdate', coordinates);
    try {
      await Trip.findByIdAndUpdate(tripId, { 
        $push: { path: { lat: coordinates.lat, lng: coordinates.lng } } 
      });
    } catch (e) {}
  });

  // 3. End Trip
  socket.on('endTrip', (tripId) => {
      io.to(tripId).emit('tripEnded'); 
  });

  // 4. SOS Triggered (Danger)
  socket.on('sosTriggered', (tripId) => {
      console.log(`🚨 SOS ON: ${tripId}`);
      io.to(tripId).emit('sosAlert'); 
  });

  // 5. SOS Cancelled (I'm Safe)
  socket.on('sosCancelled', (tripId) => {
      console.log(`💚 SOS CLEARED: ${tripId}`);
      io.to(tripId).emit('sosClear'); 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));