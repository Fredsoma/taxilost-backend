const express = require('express');
const router = express.Router();

const Taxi = require('../models/Taxi');
const Trip = require('../models/Trip');
const LostReport = require('../models/LostReport');

// 1) POST /api/passenger/register-trip
//    { taxiId, contact }
//    → find the taxi by taxiId. If found, create a Trip and return its ID.
router.post('/register-trip', async (req, res) => {
  const { taxiId, contact } = req.body;
  if (!taxiId || !contact) {
    return res.status(400).json({ error: 'Missing taxiId or contact' });
  }
  try {
    const taxi = await Taxi.findOne({ taxiId });
    if (!taxi) {
      return res.status(404).json({ error: 'Taxi not found' });
    }
    const trip = new Trip({ taxi: taxi._id, contact });
    await trip.save();
    return res.json({ success: true, tripId: trip._id, timestamp: trip.timestamp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
  
});

// 2) POST /api/passenger/report-lost
//    { tripId, description }
//    → find the trip by tripId. If found, create a LostReport.
router.post('/report-lost', async (req, res) => {
  const { tripId, description } = req.body;
  if (!tripId || !description) {
    return res.status(400).json({ error: 'Missing tripId or description' });
  }
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const report = new LostReport({ trip: trip._id, description });
    await report.save();
    return res.json({ success: true, report });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// 3) GET /api/passenger/verify-qr/:qrString
//    → Given a scanned QR string (e.g. "taxi:TAXI-1234"), verify taxi exists and return taxiId.
//    Used by front end to detect valid taxi.
router.get('/verify-qr/:qrString', async (req, res) => {
  const { qrString } = req.params;
  if (!qrString.startsWith('taxi:')) {
    return res.status(400).json({ error: 'Invalid QR code' });
  }
  const taxiId = qrString.split(':')[1];
  try {
    const taxi = await Taxi.findOne({ taxiId });
    if (!taxi) return res.status(404).json({ error: 'Taxi not found' });
    return res.json({ success: true, taxiId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
