// controllers/customerController.js
const Customer = require('../models/Customer');
const { generateProfileSummary } = require('../services/geminiService');

/**
 * @desc    Sabhi customers get karo (sab matchmakers sabhi customers dekh sakte hain)
 * @route   GET /api/customers
 * @access  Private
 */
const getCustomers = async (req, res, next) => {
  try {
    const { status, gender, search, page = 1, limit = 20 } = req.query;

    // Filter build karo — role check nahi, sab customers dikhao
    const filter = {};

    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
        { city:      { $regex: search, $options: 'i' } },
        { email:     { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .select('firstName lastName gender dateOfBirth city state maritalStatus status verified profilePhoto annualIncome designation currentCompany createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean({ virtuals: true }),
      Customer.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      customers,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Single customer ka full profile
 * @route   GET /api/customers/:id
 * @access  Private
 */
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'fullName email')
      .lean({ virtuals: true });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Naya customer add karo
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = async (req, res, next) => {
  try {
    // Auto-assign to current matchmaker
    req.body.assignedTo = req.user._id;

    const customer = await Customer.create(req.body);

    // AI summary generate karo async (non-blocking) — sirf tabhi jab Gemini key ho
    generateProfileSummary(customer).then(async (summary) => {
      if (summary) {
        await Customer.findByIdAndUpdate(customer._id, { aiSummary: summary });
      }
    }).catch(() => { /* Gemini key nahi hai to ignore karo */ });

    res.status(201).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Customer update karo
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Customer delete karo — ab koi bhi matchmaker kar sakta hai (no admin required)
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Customer ko note add karo
 * @route   POST /api/customers/:id/notes
 * @access  Private
 */
const addNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Note content required' });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            content: content.trim(),
            addedBy: req.user._id,
            addedAt: new Date(),
          },
        },
      },
      { new: true }
    ).lean({ virtuals: true });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      notes: customer.notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed dummy profiles (100+ profiles load karo)
 * @route   POST /api/customers/seed
 * @access  Private
 */
const seedDummyProfiles = async (req, res, next) => {
  try {
    const existing = await Customer.countDocuments();
    if (existing >= 50) {
      return res.status(200).json({ success: true, message: 'Profiles already seeded', count: existing });
    }

    const path = require('path');
    const { dummyProfiles } = require(path.join(__dirname, '../data/dummyProfiles'));
    
    const profiles = dummyProfiles.map(p => ({
      ...p,
      assignedTo: req.user._id,
    }));

    await Customer.insertMany(profiles, { ordered: false });
    const newCount = await Customer.countDocuments();

    res.status(201).json({
      success: true,
      message: `${newCount} profiles seeded successfully`,
      count: newCount,
    });
  } catch (error) {
    if (error.code === 11000) {
      const count = await Customer.countDocuments();
      return res.status(200).json({ success: true, message: 'Profiles seeded (some duplicates skipped)', count });
    }
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addNote,
  seedDummyProfiles,
};