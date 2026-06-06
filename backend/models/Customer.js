// models/Customer.js
const mongoose = require('mongoose');

/**
 * Customer Schema - Indian Matrimonial context ke liye
 * Sabhi important fields include kiye hain
 */
const CustomerSchema = new mongoose.Schema({
  // ─── Basic Info ───────────────────────────────────────────
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  gender:    { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dateOfBirth: { type: Date, required: true },
  
  // ─── Contact ──────────────────────────────────────────────
  email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:  { type: String, required: true },
  
  // ─── Location ─────────────────────────────────────────────
  country: { type: String, default: 'India' },
  city:    { type: String, required: true },
  state:   { type: String },
  openToRelocate: { type: String, enum: ['Yes', 'No', 'Maybe'], default: 'Maybe' },
  
  // ─── Physical ─────────────────────────────────────────────
  height:        { type: Number }, // in cm
  weight:        { type: Number }, // in kg
  bodyType:      { type: String, enum: ['Slim', 'Athletic', 'Average', 'Heavy', ''] },
  complexion:    { type: String, enum: ['Very Fair', 'Fair', 'Wheatish', 'Dark', ''] },
  bloodGroup:    { type: String },
  physicalStatus:{ type: String, enum: ['Normal', 'Differently Abled'], default: 'Normal' },
  
  // ─── Education ────────────────────────────────────────────
  highestDegree:       { type: String },
  undergradCollege:    { type: String },
  undergradDegree:     { type: String },
  postgradCollege:     { type: String },
  postgradDegree:      { type: String },
  fieldOfStudy:        { type: String },
  
  // ─── Career ───────────────────────────────────────────────
  currentCompany:      { type: String },
  designation:         { type: String },
  employmentType:      { type: String, enum: ['Employed', 'Self-Employed', 'Business', 'Not Working', ''] },
  annualIncome:        { type: Number }, // in INR lakhs
  workLocation:        { type: String },
  
  // ─── Family Background ────────────────────────────────────
  fatherName:          { type: String },
  fatherOccupation:    { type: String },
  motherName:          { type: String },
  motherOccupation:    { type: String },
  siblings:            { type: Number, default: 0 },
  siblingDetails:      { type: String }, // e.g., "1 brother, 1 sister"
  familyType:          { type: String, enum: ['Joint', 'Nuclear', ''] },
  familyStatus:        { type: String, enum: ['Middle Class', 'Upper Middle Class', 'High Class', 'Rich', ''] },
  familyValues:        { type: String, enum: ['Traditional', 'Moderate', 'Liberal', ''] },
  
  // ─── Religion & Culture ───────────────────────────────────
  religion:     { type: String },
  caste:        { type: String },
  subCaste:     { type: String },
  gotra:        { type: String }, // Hindu gotra
  mothertongue: { type: String },
  languagesKnown: [{ type: String }],
  
  // ─── Lifestyle ────────────────────────────────────────────
  diet:         { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan', ''] },
  smoking:      { type: String, enum: ['No', 'Occasionally', 'Yes', ''] },
  drinking:     { type: String, enum: ['No', 'Occasionally', 'Yes', ''] },
  openToPets:   { type: String, enum: ['Yes', 'No', 'Maybe'], default: 'Maybe' },
  hobbies:      [{ type: String }],
  interests:    [{ type: String }],
  
  // ─── Marriage & Children ──────────────────────────────────
  maritalStatus: {
    type: String,
    enum: ['Never Married', 'Divorced', 'Widowed', 'Separated'],
    required: true,
  },
  haveChildren:   { type: String, enum: ['No', 'Yes', ''] },
  numberOfChildren: { type: Number, default: 0 },
  wantKids:       { type: String, enum: ['Yes', 'No', 'Maybe'], default: 'Maybe' },
  
  // ─── Partner Preferences ──────────────────────────────────
  partnerAgeMin:         { type: Number },
  partnerAgeMax:         { type: Number },
  partnerHeightMin:      { type: Number },
  partnerHeightMax:      { type: Number },
  partnerIncomeMin:      { type: Number },
  partnerReligion:       [{ type: String }],
  partnerCaste:          [{ type: String }],
  partnerEducation:      { type: String },
  partnerLocation:       [{ type: String }],
  partnerMaritalStatus:  [{ type: String }],
  partnerDiet:           { type: String },
  
  // ─── Matchmaking Status ───────────────────────────────────
  status: {
    type: String,
    enum: ['Active', 'On Hold', 'Matched', 'Inactive', 'New'],
    default: 'New',
  },
  profileScore:   { type: Number, default: 0 }, // 0-100, profile completeness
  profilePhoto:   { type: String, default: '' },
  verified:       { type: Boolean, default: false },
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // ─── Notes ────────────────────────────────────────────────
  notes: [{
    content:    { type: String },
    addedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt:    { type: Date, default: Date.now },
  }],
  
  // ─── AI Generated ─────────────────────────────────────────
  aiSummary: { type: String }, // Gemini generated profile summary
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: Age calculate karo DOB se
CustomerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

// Virtual: Full name
CustomerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for faster queries
CustomerSchema.index({ gender: 1, status: 1 });
CustomerSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);