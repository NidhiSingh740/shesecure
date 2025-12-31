const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Zone = require('../models/Zone');

// Get Zones
router.get('/', protect, async (req, res) => {
  try {
    const zones = await Zone.find({ user: req.user.id });
    res.json(zones);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Add Zone
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, lat, lng, radius, activeStart, activeEnd } = req.body;
    const newZone = new Zone({
      user: req.user.id, name, type, location: { lat, lng }, radius, activeStart, activeEnd
    });
    const saved = await newZone.save();
    res.json(saved);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Delete Zone
router.delete('/:id', protect, async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) return res.status(404).json({ msg: 'Not found' });
    if (zone.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    await zone.deleteOne();
    res.json({ msg: 'Removed' });
  } catch (err) { res.status(500).send('Server Error'); }
});

module.exports = router;