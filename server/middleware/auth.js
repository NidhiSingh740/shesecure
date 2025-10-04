
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Token verification middleware
exports.protect = async function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    req.user = user; // Attach full user object to request
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }   
};

// ✅ Role-based access control middleware                  
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Access denied: Role '${req.user ? req.user.role : 'Unknown'}' not authorized.`,
      });
    }
    next();
  };
};

// ✅ Optional: Specific role check middlewares
exports.isCustomer = (req, res, next) => {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({ msg: 'Access denied: Customers only' });
  }
  next();
};

exports.isTailor = (req, res, next) => {
  if (!req.user || req.user.role !== 'tailor') {
    return res.status(403).json({ msg: 'Access denied: Tailors only' });
  }
  next();
};

exports.isStaff = (req, res, next) => {
  if (!req.user || req.user.role !== 'staff') {
    return res.status(403).json({ msg: 'Access denied: Staff only' });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  next();
};


