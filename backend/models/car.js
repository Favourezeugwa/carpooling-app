const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  regExpiry: { type: Date, required: true },
  insuranceID: { type: String, required: true },
  insuranceExpiry: { type: Date, required: true },
  isVerified: { type: Boolean, default: false }, // Indicates if the car is verified
});

module.exports = mongoose.model('car', carSchema);
