const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');

// --- Route Imports ---
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');

// --- PROOF THAT THIS FILE IS LOADED ---
console.log("✅ Loading the CORRECT server.js file with contact routes enabled.");

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.error('Database connection error:', err));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes); // This line is correct

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

