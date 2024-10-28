const mongoose = require('mongoose');

const carpoolSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  carpoolName: { type: String, required: true }, // Description of the event (e.g., "Baseball Game")
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  dateTime: { type: Date, required: true },
  role: { type: String, enum: ['Rider', 'Driver'], required: true },
  carType: { 
    type: String, 
    enum: ['Private', 'Rental'], 
    default: 'Private' 
  },
  isPublic: { 
    type: Boolean, 
    default: false 
  }, // Determines if the carpool is viewable by others
  carpoolers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      role: { type: String, enum: ['Rider', 'Driver'], required: true }
    }
  ],
  invitations: [
    {
      email: { type: String, required: true },
      role: { type: String, enum: ['Rider', 'Driver'] }
    }
  ], // Invited users with their roles (rider/driver)
  status: { type: String, enum: ['Upcoming','Active', 'Completed', 'Canceled'], default: 'Upcoming' },
  maxCarpoolers: { type: Number, required: true },
  currentCarpoolers: { type: Number, default: 1 },
  estimatedCost: { type: String }, // Optional estimated cost per person
  specialNotes: { type: String } // Additional information like meet-up points
  });

module.exports = mongoose.model('Carpool', carpoolSchema);
      