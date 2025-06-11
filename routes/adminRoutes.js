const express = require('express');
const router = express.Router();
const FoundReport = require('../models/FoundReport');
const LostReport = require('../models/LostReport');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/admin/found-reports
// Returns all found item reports submitted by taxi drivers
router.get('/found-reports', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const reports = await FoundReport.find()
      .sort({ date: -1 }) 
      .populate('driver', 'fullName email taxiId');

    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports for admin:', err);
    res.status(500).json({ error: 'Failed to load reports' });
  }
});

// Get all lost item reports (admin only)
router.get('/lost-reports', authMiddleware, async (req, res) => {
  try {
    const reports = await LostReport.find()
      .populate('user', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching lost reports:', err);
    res.status(500).json({ error: 'Failed to fetch lost reports.' });
  }
});

// Update report status (mark lost report as Found)
router.patch('/update-report-status/:reportId', authMiddleware, async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  if (!['Lost', 'Found'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const report = await LostReport.findById(reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.status = status;
    await report.save();

    res.json({ message: `Report status updated to ${status}` });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ error: 'Failed to update report status.' });
  }
});

// ✅ GET /api/admin/driver/:taxiId
// Get driver information by taxi ID
router.get('/driver/:taxiId', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const driver = await User.findOne({ taxiId: req.params.taxiId })
      .select('-password')
      .populate('foundItems');

    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    res.json(driver);
  } catch (err) {
    console.error('Error fetching driver by Taxi ID:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Ban a driver by taxiId with reason
router.patch('/ban-driver/:taxiId', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { taxiId } = req.params;
    const { reason } = req.body;

    const driver = await User.findOne({ taxiId, role: 'taxidriver' });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.isBanned = true;
    driver.banReason = reason || 'No reason provided';
    driver.banDate = new Date();
    await driver.save();

    res.json({ message: `Driver ${taxiId} banned. Reason: ${driver.banReason}` });
  } catch (err) {
    console.error('Ban driver error:', err);
    res.status(500).json({ error: 'Failed to ban driver' });
  }
});

// Unban a driver by taxiId
router.patch('/unban-driver/:taxiId', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { taxiId } = req.params;
    const driver = await User.findOne({ taxiId, role: 'taxidriver' });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    driver.isBanned = false;
    driver.banReason = '';
    driver.banDate = null;
    await driver.save();

    res.json({ message: `Driver ${taxiId} has been unbanned.` });
  } catch (err) {
    console.error('Unban driver error:', err);
    res.status(500).json({ error: 'Failed to unban driver' });
  }
});

// Get all banned drivers
router.get('/banned-drivers', authMiddleware, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const bannedDrivers = await User.find({ role: 'taxidriver', isBanned: true }).select('-password');
    res.json(bannedDrivers);
  } catch (err) {
    console.error('Fetch banned drivers error:', err);
    res.status(500).json({ error: 'Failed to fetch banned drivers' });
  }
});



module.exports = router;
