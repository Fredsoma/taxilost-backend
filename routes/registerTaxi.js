
const express = require('express');
const router = express.Router();
const Taxi = require('../models/Taxi');

// POST /api/register-taxi
router.post('/', async (req, res) => {
  const { driverName, phone, carPlate } = req.body;
  if (!driverName || !phone || !carPlate) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const taxiId = 'TX-' + Math.floor(100000 + Math.random() * 900000);
    const newTaxi = new Taxi({ driverName, phone, carPlate, taxiId });
    await newTaxi.save();
    return res.status(201).json({ taxiId });
  } catch (err) {
    console.error('RegisterTaxi error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;
