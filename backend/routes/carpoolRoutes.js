const express = require('express');
const Carpool = require('../models/carpool');
const { authenticateUser } = require('../middleware/authenticateUser');

const router = express.Router();

// Create carpool route
router.post('/create-carpool', authenticateUser, async (req, res) => {
    const { event, meetuplocation, destination, dateTime } = req.body;
  
    try {
      // Create a new carpool
      const newCarpool = new Carpool({
        creator: req.user._id,
        event,
        meetuplocation,
        destination,
        dateTime,
        drivers: [],
        riders: [],
        invitations: [],
      });
  
      // Save the carpool to the database
      await newCarpool.save();
  
      res.status(201).json({ message: 'Carpool created successfully', carpool: newCarpool });
    } catch (error) {
      console.error('Error creating carpool:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Join a Carpool as a Driver
router.post('/join-carpool/:carpoolId/driver', authenticateUser, async (req, res) => {
    const { carpoolId } = req.params;
  
    try {
      // Check if the user has a verified car
      const userCars = await car.find({ owner: req.user._id, isVerified: true });
      if (userCars.length === 0) {
        return res.status(400).json({ message: 'You must have a verified car to join as a driver' });
      }
  
      // Find the carpool
      const carpool = await carpool.findById(carpoolId);
      if (!carpool) {
        return res.status(404).json({ message: 'Carpool not found' });
      }
  
      // Add the user as a driver
      if (!carpool.drivers.includes(req.user._id)) {
        carpool.drivers.push(req.user._id);
      }
  
      await carpool.save();
      res.status(200).json({ message: 'Joined as a driver successfully', carpool });
    } catch (error) {
      console.error('Error joining as a driver:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
  module.exports = router;