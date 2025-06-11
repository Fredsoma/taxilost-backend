const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  taxi: { type: mongoose.Schema.Types.ObjectId, ref: 'Taxi', required: true },
  contact: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);
