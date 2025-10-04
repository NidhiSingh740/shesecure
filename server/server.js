const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const dbURI = "mongodb+srv://princessnidhi229:nikki2209@cluster0.nex2box.mongodb.net/ai-health?retryWrites=true&w=majority&appName=Cluster0";

// CORRECTED LINE: The deprecated options have been removed.
mongoose.connect(dbURI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch((err) => console.error('Database connection error:', err));

// --- API Routes ---
app.use('/api/auth', authRoutes);


// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

