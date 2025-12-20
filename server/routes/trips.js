const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip');

// Start Trip
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
  } catch (err) { res.status(500).send('Server Error'); }
});

// End Trip
router.post('/:tripId/end', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) return res.status(404).json({ msg: 'Not found' });
        trip.isActive = false;
        trip.status = 'completed';
        trip.endedAt = Date.now();
        await trip.save();
        res.json(trip);
    } catch (err) { res.status(500).send('Server Error'); }
});

// Trigger SOS
router.post('/:tripId/sos', protect, async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) return res.status(404).json({ msg: 'Not found' });
        trip.status = 'sos'; 
        // trip.sosAlerts.push({ location: { lat, lng } }); // Uncomment if schema updated
        await trip.save();
        res.json(trip);
    } catch (err) { res.status(500).send('Server Error'); }
});

// Mark Safe (All Clear)
router.post('/:tripId/safe', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) return res.status(404).json({ msg: 'Not found' });
        trip.status = 'active'; 
        await trip.save();
        res.json(trip);
    } catch (err) { res.status(500).send('Server Error'); }
});

// Get Trip
router.get('/:tripId', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId).populate('userId', 'fullName');
        if (!trip) return res.status(404).json({ msg: 'Trip not found.' });
        res.json(trip);
    } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;