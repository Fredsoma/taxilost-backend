const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  foundItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoundReport' }],
 isBanned: {
  type: Boolean,
  default: false,
},
banReason: {
  type: String,
  default: '',
},
banDate: {
  type: Date,
  default: null,
},



 role: {
  type: String,
  enum: ['client', 'taxidriver', 'admin'], 
  required: true,
},

  // These fields are specific to taxi drivers
  licenseNumber: {
    type: String,
    required: function () {
      return this.role === 'taxidriver';
    },
  },
  vehiclePlate: {
    type: String,
    required: function () {
      return this.role === 'taxidriver';
    },
  },
  vehicleModel: {
    type: String,
    required: function () {
      return this.role === 'taxidriver';
    },
  },
  taxiId: {
    type: String,
    unique: true,
    sparse: true, 
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
