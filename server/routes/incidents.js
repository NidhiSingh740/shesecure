const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Incident = require('../models/Incident');

// GET all incidents (Public - used for Map & Safety Score)
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ timestamp: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST a new incident report (Private)
router.post('/', protect, async (req, res) => {
  const { type, description, lat, lng } = req.body;
  try {
    const newIncident = new Incident({
      userId: req.user.id,
      type,
      description,
      location: { lat, lng }
    });
    await newIncident.save();
    res.json(newIncident);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;