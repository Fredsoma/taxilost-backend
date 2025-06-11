
const mongoose = require('mongoose');

const lostReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    taxiId: { type: String },
    status: { type: String, enum: ['Pending', 'Found'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostReport', lostReportSchema);
