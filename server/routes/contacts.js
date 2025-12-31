
// server/routes/contacts.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Your existing auth middleware
const User = require('../models/User');

// GET all contacts for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.trustedContacts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST a new contact
router.post('/', protect, async (req, res) => {
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ msg: 'Name and phone are required.' });

  try {
    const user = await User.findById(req.user.id);
    user.trustedContacts.push({ name, phone });
    await user.save();
    res.status(201).json(user.trustedContacts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE a contact by its ID
router.delete('/:contactId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.trustedContacts = user.trustedContacts.filter(
      (contact) => contact._id.toString() !== req.params.contactId
    );
    await user.save();
    res.json(user.trustedContacts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;

