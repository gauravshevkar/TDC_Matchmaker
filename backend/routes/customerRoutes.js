// routes/customerRoutes.js
const express = require('express');
const {
  getCustomers, getCustomer, createCustomer, updateCustomer,
  deleteCustomer, addNote, seedDummyProfiles,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Sabhi routes protected hain

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.post('/seed', seedDummyProfiles);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(deleteCustomer); // adminOnly hata diya — matchmaker delete kar sakta hai

router.post('/:id/notes', addNote);

module.exports = router;