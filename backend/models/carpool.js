const mongoose = require('mongoose');

const carpoolSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  event: { type: String, required: true }, // Description of the event (e.g., "Baseball Game")
  meetuplocation: { type: String, required: true },
  destination: { type: String, required: true },
  dateTime: { type: Date, required: true },
  drivers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, // Reference to the verified car
    },
  ],
  riders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Users who are riders
  invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Invited users
  status: { type: String, enum: ['Upcoming','Active', 'Completed', 'Canceled'], default: 'Upcoming' },
  maxRiders: { type: Number, required: true },
  });

module.exports = mongoose.model('Carpool', carpoolSchema);
      