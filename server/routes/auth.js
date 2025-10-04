const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User model is still needed

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  // FIX: Simplified to only expect fullName, email, and password
  const { fullName, email, password } = req.body;

  // Basic validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check for existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with that email' });
    }

    // Create new user instance
    // FIX: 'role' is no longer set here. It will use the default from the User model ('customer')
    user = new User({
      fullName,
      email,
      password,
    });

    await user.save(); // Save the new user to the database

    // FIX: All logic for creating a Tailor has been completely removed.

    // Respond with a clear success message
    res.status(201).json({ msg: 'Registration successful! Please login.' });

  } catch (error) {
    console.error('Signup Server Error:', error.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role, // Role is still useful in the token for future frontend logic
      },
    };

    if (!process.env.JWT_SECRET_KEY) {
      console.error('FATAL ERROR: JWT_SECRET_KEY is not defined!');
      return res.status(500).json({ msg: 'Server configuration error.' });
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ msg: 'Login successful!', token, role: user.role });
      }
    );

  } catch (error) {
    console.error('Login Server Error:', error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

