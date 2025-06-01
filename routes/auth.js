const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Driver = require('../models/Driver');

// POST /api/auth/register
// { name, phone, password }
router.post('/register', async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const existing = await Driver.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Phone already in use' });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const driver = new Driver({ name, phone, passwordHash });
    await driver.save();
    return res.json({ success: true, message: 'Driver registered' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
// { phone, password }
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: 'Missing phone or password' });
  }
  try {
    const driver = await Driver.findOne({ phone });
    if (!driver) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const valid = await driver.verifyPassword(password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ success: true, token, driver: { id: driver._id, name: driver.name, phone: driver.phone } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
