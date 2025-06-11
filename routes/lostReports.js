
const express = require('express');
const router = express.Router();
const LostReport = require('../models/LostReport');
const Taxi = require('../models/Taxi');
const authMiddleware = require('../middleware/authMiddleware');

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

// POST /api/client/lost-report
router.post('/lost-report', authMiddleware, async (req, res) => {
  const { description, taxiId } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required.' });
  }

  try {
    const userId = req.user.userId; // from auth middleware

    const newReport = new LostReport({
      user: userId,
      description,
      taxiId,
    });

    await newReport.save();

    return res.status(201).json(newReport);
  } catch (err) {
    console.error('Error saving lost report:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});


module.exports = router;
