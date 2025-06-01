// backend/routes/taxi.js

const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

const Taxi       = require('../models/Taxi');
const Trip       = require('../models/Trip');
const LostReport = require('../models/LostReport');

// -----------------------------------------------------------------------------
// PUBLIC ROUTE
// GET /api/taxi/:taxiId
// Returns driver info by taxiId (no JWT or other middleware required)
// -----------------------------------------------------------------------------
router.get('/:taxiId', async (req, res) => {
  try {
    const { taxiId } = req.params;
    const taxi = await Taxi.findOne({ taxiId });

    if (!taxi) {
      return res.status(404).json({ error: 'Taxi not found' });
    }

    // Return only the driver’s publicly visible fields:
    return res.json({
      driverName: taxi.driverName,
      phone:      taxi.phone,
      carPlate:   taxi.carPlate,
      taxiId:     taxi.taxiId,
    });
  } catch (err) {
    console.error('Taxi lookup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// -----------------------------------------------------------------------------
module.exports = router;
