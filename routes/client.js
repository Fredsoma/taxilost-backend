const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const LostReport = require('../models/LostReport');
const User = require('../models/User');
const DriverFeedback = require('../models/DriverFeedback');

// Get client profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit lost report
router.post('/lost-report', authMiddleware, async (req, res) => {
  const { description, taxiId } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required.' });
  }

  try {
    const report = new LostReport({
      user: req.user.userId,
      description,
      taxiId,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully." });
  } catch (err) {
    console.error('Error submitting report:', err);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// Get all client's lost reports
router.get('/lost-reports', authMiddleware, async (req, res) => {
  try {
    const reports = await LostReport.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

module.exports = router;
