const User = require('../models/User');
const FoundReport = require('../models/FoundReport');

// Get Taxi Driver Profile (GET /api/taxidriver/me)
const getTaxiDriverProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    if (role !== 'taxidriver') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const driver = await User.findById(userId)
    .select('-password')
    .populate('foundItems');
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    res.json(driver);
  } catch (err) {
    console.error('Error fetching driver profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update Taxi Driver Profile (PUT /api/taxidriver/update)
const updateTaxiDriverProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    if (role !== 'taxidriver') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updates = req.body;
    const updatedDriver = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');

    res.json({ message: 'Profile updated', user: updatedDriver });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Submit Found Item Report (POST /api/taxidriver/report-found-item)
const reportFoundItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const { description } = req.body;

    const report = new FoundReport({
      driver: userId,
      description,
      date: new Date(),
    });

    await report.save();

    // Associate report with driver
    await User.findByIdAndUpdate(userId, {
      $push: { foundItems: report._id },
    });

    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    console.error('Error submitting found item:', err);
    res.status(500).json({ error: 'Server error while submitting report' });
  }
};


module.exports = {
  getTaxiDriverProfile,
  updateTaxiDriverProfile,
  reportFoundItem,
};
