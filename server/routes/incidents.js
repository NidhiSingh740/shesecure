// server/routes/incidents.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Incident = require('../models/Incident');

// GET all incidents (Public)
router.get('/', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ timestamp: -1 });
    res.json(incidents);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST a new incident (Private)
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

// DELETE an incident (Private & Owner Only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);
        
        if (!incident) {
            return res.status(404).json({ msg: 'Incident not found' });
        }

        // Check user ownership
        if (incident.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized to delete this report' });
        }

        await incident.deleteOne();
        res.json({ msg: 'Incident removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;