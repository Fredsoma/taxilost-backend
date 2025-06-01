// backend/routes/lostReports.js
const express = require('express');
const router = express.Router();
const LostReport = require('../models/LostReport');
const Taxi = require('../models/Taxi');

// GET /api/lost-reports
// Returns all lost‐item reports (most recent first)
router.get('/', async (req, res) => {
  try {
    const reports = await LostReport.find().sort({ timestamp: -1 });
    return res.json(reports);
  } catch (err) {
    console.error('Error fetching lost reports:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/lost-reports
// { taxiId, contact, itemName }
router.post('/', async (req, res) => {
  const { taxiId, name, contact, itemName } = req.body;
  if (!taxiId || !name || !contact || !itemName) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Look up taxi in the Taxi collection
    const taxi = await Taxi.findOne({ taxiId });
    const matchedDriver = taxi
      ? {
          name: taxi.driverName,
          phone: taxi.phone,
          carPlate: taxi.carPlate,
          taxiId: taxi.taxiId
        }
      : null;

    // Save new lost report
    const newReport = new LostReport({ taxiId, name, contact, itemName, matchedDriver });
    const saved = await newReport.save();

    return res.status(201).json({ matchedDriver });
  } catch (err) {
    console.error('Error saving lost report:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
