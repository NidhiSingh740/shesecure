const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip');

// POST /start
router.post('/start', protect, async (req, res) => {
  try {
    const { destination } = req.body;
    const newTrip = new Trip({
      userId: req.user.id,
      status: 'active',
      destination: destination || {},
      path: [] 
    });
    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /:id/end
router.post('/:tripId/end', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });
        
        trip.status = 'completed';
        trip.endedAt = Date.now();
        await trip.save();
        res.json(trip);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST /:id/sos (Trigger Emergency)
router.post('/:tripId/sos', protect, async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });

        trip.status = 'sos'; // Mark as emergency in DB
        trip.sosAlerts.push({ location: { lat, lng } });
        await trip.save();

        res.json(trip);
    } catch (err) {
        console.error("SOS API Error:", err);
        res.status(500).send('Server Error');
    }
});

// GET /:id
router.get('/:tripId', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId).populate('userId', 'fullName');
        if (!trip) return res.status(404).json({ msg: 'Trip not found.' });
        res.json(trip);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;