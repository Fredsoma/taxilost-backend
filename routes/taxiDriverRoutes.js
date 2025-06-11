const express = require('express');
const {
  getTaxiDriverProfile,
  updateTaxiDriverProfile,
  reportFoundItem,
} = require('../controllers/driverController');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

// GET profile
router.get('/me', requireAuth, getTaxiDriverProfile);

// PUT update profile
router.put('/update', requireAuth, updateTaxiDriverProfile);

// POST found item report
router.post('/report-found-item', requireAuth, reportFoundItem);

module.exports = router;
