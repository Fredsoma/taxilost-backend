
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DriverFeedback', feedbackSchema);
