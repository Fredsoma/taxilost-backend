const mongoose = require('mongoose');

const TaxiSchema = new mongoose.Schema({
  driverName: { type: String, required: true },
  phone:       { type: String, required: true },
  carPlate:    { type: String, required: true },
  taxiId:      { type: String, required: true, unique: true },
  createdAt:   { type: Date,   default: Date.now },
});

module.exports = mongoose.model('Taxi', TaxiSchema);
