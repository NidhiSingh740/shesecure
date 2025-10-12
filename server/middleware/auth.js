const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This function protects routes that require a user to be logged in.
exports.protect = async (req, res, next) => {
  console.log('--- "Protect" Middleware Activated ---');
  let token;

  // 1. Check for the token in the header
  if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
    console.log('✅ Token found in header.');
  }

  if (!token) {
    console.log('❌ ERROR: No token found. Denying access.');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // 2. Check if the JWT_SECRET_KEY is loaded
    if (!process.env.JWT_SECRET_KEY) {
        console.log('❌ FATAL ERROR: JWT_SECRET_KEY is not defined in .env file!');
        return res.status(500).json({ msg: 'Server configuration error.' });
    }
    console.log('✅ JWT_SECRET_KEY is loaded.');

    // 3. Verify the token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('✅ Token is valid. Decoded user ID:', decoded.user.id);

    // 4. Find the user in the database
    req.user = await User.findById(decoded.user.id).select('-password');

    if (!req.user) {
      console.log('❌ ERROR: User from token not found in database. Denying access.');
      return res.status(401).json({ msg: 'Authorization denied, user not found' });
    }
    
    console.log('✅ User found in database. Granting access.');
    console.log('--- Middleware finished ---');
    next(); // Success! Proceed to the route.
  } catch (err) {
    console.log('❌ TOKEN VERIFICATION FAILED:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

