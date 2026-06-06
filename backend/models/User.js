// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Matchmaker User Schema
 * Ye un logon ke liye hai jo dashboard use karenge (TDC team)
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username required hai'],
    unique: true,
    trim: true,
    minlength: [3, 'Username kam se kam 3 characters ka hona chahiye'],
    maxlength: [30, 'Username zyada se zyada 30 characters ka hona chahiye'],
  },
  email: {
    type: String,
    required: [true, 'Email required hai'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Valid email dalo'],
  },
  password: {
    type: String,
    required: [true, 'Password required hai'],
    minlength: [6, 'Password kam se kam 6 characters ka hona chahiye'],
    select: false,
  },
  fullName: {
    type: String,
    required: [true, 'Full name required hai'],
    trim: true,
  },
  // role field completely remove — sab matchmaker hain
  avatar: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Password save karne se pehle hash karo
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password compare karne ka method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Sensitive data JSON mein nahi aayega
UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);