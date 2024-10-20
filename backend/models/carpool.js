const mongoose = require('mongoose');

const carpoolSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  event: { type: String, required: true }, // Description of the event (e.g., "Baseball Game")
  location: { type: String, required: true },
  dateTime: { type: Date, required: true },
  drivers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Users who are drivers
  riders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Users who are riders
  invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Invited users
  carRequired: { type: Boolean, default: true }, // If a verified car is required for drivers
});

module.exports = mongoose.model('carpool', carpoolSchema);
