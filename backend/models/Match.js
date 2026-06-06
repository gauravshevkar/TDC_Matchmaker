// models/Match.js
const mongoose = require('mongoose');

/**
 * Match Schema - Do customers ke beech proposed match ko track karta hai
 */
const MatchSchema = new mongoose.Schema({
  // Kiska match propose kiya gaya
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  // Kis se match propose kiya gaya
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  // Kis matchmaker ne propose kiya
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // AI generated match score (0-100)
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  
  // Match category
  matchCategory: {
    type: String,
    enum: ['High Potential', 'Good Match', 'Moderate Match', 'Exploratory'],
    default: 'Exploratory',
  },
  
  // AI generated explanation
  aiExplanation: {
    type: String,
    default: '',
  },
  
  // Compatibility breakdown
  compatibilityFactors: {
    ageCompatibility:      { score: Number, note: String },
    locationCompatibility: { score: Number, note: String },
    educationCompatibility:{ score: Number, note: String },
    valuesCompatibility:   { score: Number, note: String },
    lifestyleCompatibility:{ score: Number, note: String },
    familyCompatibility:   { score: Number, note: String },
  },
  
  // Match ka status
  status: {
    type: String,
    enum: ['Suggested', 'Sent', 'Accepted', 'Rejected', 'On Hold'],
    default: 'Suggested',
  },
  
  // Kab email bheja
  sentAt: {
    type: Date,
  },
  
  // Matchmaker notes
  notes: {
    type: String,
    default: '',
  },
  
  // AI generated intro email
  introEmail: {
    type: String,
    default: '',
  },
  
}, {
  timestamps: true,
});

// Ek customer ke liye duplicate matches prevent karo
MatchSchema.index({ customer: 1, matchedWith: 1 }, { unique: true });

module.exports = mongoose.model('Match', MatchSchema);