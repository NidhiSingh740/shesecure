// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password in queries by default
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ['customer', 'tailor', 'staff', 'admin'],
    default: 'customer',
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ Female Measurement Assistant related fields
  measurementRequest: {
    requested: { type: Boolean, default: false },
    preferredGender: { type: String, enum: ['female', 'any'], default: 'any' },
    appointmentDate: { type: Date }, // Scheduled date & time
    visitStatus: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    measurements: {
      bust: { type: Number },
      waist: { type: Number },
      hips: { type: Number },
      inseam: { type: Number },
      // add more measurements if needed
    },
  },
});

// Password hashing before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
