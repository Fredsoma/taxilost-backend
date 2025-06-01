// backend/models/LostReport.js
const mongoose = require('mongoose');

const LostReportSchema = new mongoose.Schema({
  taxiId:      { type: String, required: true },
  name:        { type: String, required: true },
  contact:     { type: String, required: true },
  itemName:    { type: String, required: true },
  timestamp:   { type: Date,   default: Date.now },
  matchedDriver: {
    name:     { type: String },
    phone:    { type: String },
    carPlate: { type: String },
    taxiId:   { type: String }
  }
});

module.exports = mongoose.model('LostReport', LostReportSchema);
