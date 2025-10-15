
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip');
const User = require('../models/User');

// @route   POST /api/trips/start
// @desc    Start a new trip for the logged-in user
// @access  Private
router.post('/start', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newTrip = new Trip({
      userId: user._id,
      path: [], // Start with an empty path
    });

    await newTrip.save();

    // Here you would add logic to notify trusted contacts via SMS (e.g., using Twilio)
    // For now, we just return the trip details.

    res.status(201).json(newTrip);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/trips/:tripId
// @desc    Get trip details for the public tracking page
// @access  Public
router.get('/:tripId', async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId).populate('userId', 'fullName');
        if (!trip) {
            return res.status(404).json({ msg: 'Trip not found.' });
        }
        res.json(trip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
