const express = require("express");
const Carpool = require("../models/carpool");
const { authenticateUser } = require("../middleware/authenticateUser");
const {
  sendInvitationEmail,
  sendNotificationEmail,
} = require("../emailservice");

const router = express.Router();

// Create Carpool Route
router.post("/create-carpool", authenticateUser, async (req, res) => {
  const {
    carpoolName,
    pickupLocation,
    dropoffLocation,
    dateTime,
    role,
    carType,
    maxCarpoolers,
    estimatedCost,
    specialNotes,
    invitations,
  } = req.body;

  try {
    // Validate required fields
    if (
      !carpoolName ||
      !pickupLocation ||
      !dropoffLocation ||
      !dateTime ||
      !role ||
      !maxCarpoolers
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Check if a carpool with the same details already exists for this user
    const existingCarpool = await Carpool.findOne({
      creator: req.user._id,
      carpoolName,
      pickupLocation,
      dropoffLocation,
      dateTime,
    });

    if (existingCarpool) {
      return res
        .status(400)
        .json({ message: "A carpool with these details already exists." });
    }

    // Create new carpool entry
    const newCarpool = new Carpool({
      creator: req.user._id, // ID of the authenticated user creating the carpool
      carpoolName,
      pickupLocation,
      dropoffLocation,
      dateTime,
      role,
      carType,
      maxCarpoolers,
      estimatedCost,
      specialNotes,
      invitations,
    });

    // Save the new carpool entry to the database
    await newCarpool.save();
    res
      .status(201)
      .json({ message: "Carpool created successfully", carpool: newCarpool });
  } catch (error) {
    console.error("Error creating carpool:", error);
    console.log("Authenticated User:", req.user);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Carpool Route
router.put("/update-carpool/:carpoolId", authenticateUser, async (req, res) => {
  const { carpoolId } = req.params;
  const {
    carpoolName,
    pickupLocation,
    dropoffLocation,
    dateTime,
    role,
    carType,
    maxCarpoolers,
    estimatedCost,
    specialNotes,
    invitations,
  } = req.body;

  try {
    // Find the carpool by ID
    const carpool = await Carpool.findOne({
      _id: carpoolId,
      creator: req.user._id,
    }); // Ensure only the creator can edit
    if (!carpool) {
      return res.status(404).json({
        message:
          "Carpool not found or you're not authorized to edit this carpool",
      });
    }

    // Update the carpool fields
    carpool.carpoolName = carpoolName || carpool.carpoolName;
    carpool.pickupLocation = pickupLocation || carpool.pickupLocation;
    carpool.dropoffLocation = dropoffLocation || carpool.dropoffLocation;
    carpool.dateTime = dateTime || carpool.dateTime;
    carpool.role = role || carpool.role;
    carpool.carType = carType || carpool.carType;
    carpool.maxCarpoolers = maxCarpoolers || carpool.maxCarpoolers;
    carpool.estimatedCost = estimatedCost || carpool.estimatedCost;
    carpool.specialNotes = specialNotes || carpool.specialNotes;
    carpool.invitations = invitations || carpool.invitations;

    // Save the updated carpool entry to the database
    await carpool.save();
    res.status(200).json({ message: "Carpool updated successfully", carpool });
  } catch (error) {
    console.error("Error updating carpool:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Join Carpool
router.post("/join-carpool/:carpoolId", authenticateUser, async (req, res) => {
  const { carpoolId } = req.params;
  const { role } = req.body; // Role can be 'Rider' or 'Driver'

  try {
    const carpool = await Carpool.findById(carpoolId);

    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Check if maxCarpoolers limit is reached
    if (carpool.currentCarpoolers >= carpool.maxCarpoolers) {
      return res
        .status(400)
        .json({ message: "This carpool has reached its maximum capacity" });
    }

    // Check if the user is already in the carpool
    const isAlreadyInCarpool = carpool.carpoolers.some((carpooler) =>
      carpooler.user.equals(req.user._id)
    );

    if (isAlreadyInCarpool) {
      return res
        .status(400)
        .json({ message: "You are already part of this carpool" });
    }

    // Add the user to carpoolers array with the specified role
    carpool.carpoolers.push({ user: req.user._id, role });
    carpool.currentCarpoolers += 1;

    await carpool.save();
    res
      .status(200)
      .json({ message: "Successfully joined the carpool", carpool });
  } catch (error) {
    console.error("Error joining carpool:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to leave a carpool
router.post("/leave-carpool/:carpoolId", authenticateUser, async (req, res) => {
  const { carpoolId } = req.params;

  try {
    // Find the carpool
    const carpool = await Carpool.findById(carpoolId);

    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Check if the user is the creator
    if (carpool.creator.equals(req.user._id)) {
      // If the creator is leaving, delete the carpool
      await Carpool.findByIdAndDelete(carpoolId);
      return res
        .status(200)
        .json({ message: "Carpool deleted as creator left" });
    }

    // If the user is a driver, remove them from the drivers array
    carpool.drivers = carpool.drivers.filter(
      (driver) => !driver.user.equals(req.user._id)
    );

    // If the user is a rider, remove them from the riders array
    carpool.riders = carpool.riders.filter(
      (rider) => !rider.equals(req.user._id)
    );

    // Save the updated carpool
    await carpool.save();

    res.status(200).json({ message: "You have left the carpool", carpool });
  } catch (error) {
    console.error("Error leaving carpool:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to delete a carpool (only the creator can delete)
router.delete(
  "/delete-carpool/:carpoolId",
  authenticateUser,
  async (req, res) => {
    const { carpoolId } = req.params;

    try {
      // Find the carpool
      const carpool = await Carpool.findById(carpoolId);

      if (!carpool) {
        return res.status(404).json({ message: "Carpool not found" });
      }

      // Check if the user is the creator of the carpool
      if (!carpool.creator.equals(req.user._id)) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this carpool" });
      }

      // Delete the carpool
      await Carpool.findByIdAndDelete(carpoolId);
      res.status(200).json({ message: "Carpool deleted successfully" });
    } catch (error) {
      console.error("Error deleting carpool:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/invite-to-carpool/:carpoolId",
  authenticateUser,
  async (req, res) => {
    const { carpoolId } = req.params;
    const { invitations } = req.body; // Array of { email, role }

    try {
      const carpool = await Carpool.findById(carpoolId);

      if (!carpool) {
        return res.status(404).json({ message: "Carpool not found" });
      }

      // Ensure only the creator can send invitations
      if (!carpool.creator.equals(req.user._id)) {
        return res.status(403).json({
          message:
            "You are not authorized to send invitations for this carpool",
        });
      }

      // Filter out duplicate invitations
      const newInvitations = invitations.filter(
        (invite) =>
          !carpool.invitations.some(
            (existingInvite) => existingInvite.email === invite.email
          )
      );

      // Check if adding these invitations would exceed maxCarpoolers
      const totalCarpoolersIfAdded =
        carpool.currentCarpoolers + newInvitations.length;
      if (totalCarpoolersIfAdded > carpool.maxCarpoolers) {
        return res.status(400).json({
          message: `Invitations exceed the maximum capacity of the carpool. Maximum carpoolers allowed is ${carpool.maxCarpoolers}`,
        });
      }

      // Add each new invitation to the carpool and send invitation emails
      const emailPromises = newInvitations.map(async (invite) => {
        carpool.invitations.push({ email: invite.email, role: invite.role });
        return sendInvitationEmail(invite.email, carpoolId); // Send invitation email
      });

      // Increment currentCarpoolers count by the number of new invitations
      carpool.currentCarpoolers += newInvitations.length;

      await Promise.all(emailPromises); // Ensure all emails are sent before saving
      await carpool.save();

      res
        .status(200)
        .json({ message: "Invitations sent successfully", carpool });
    } catch (error) {
      console.error("Error inviting users to carpool:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post("/accept-invite/:carpoolId", authenticateUser, async (req, res) => {
  const { carpoolId } = req.params;

  try {
    const carpool = await Carpool.findById(carpoolId).populate("creator");

    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Check if the user has been invited with a specified role
    const invitation = carpool.invitations.find(
      (invite) => invite.email === req.user.email
    );
    if (!invitation) {
      return res
        .status(403)
        .json({ message: "You are not invited to join this carpool" });
    }

    // Check if maxCarpoolers limit is reached
    if (carpool.currentCarpoolers >= carpool.maxCarpoolers) {
      return res
        .status(400)
        .json({ message: "This carpool has reached its maximum capacity" });
    }

    // Add the user to carpoolers array with the specified role from the invitation
    carpool.carpoolers.push({ user: req.user._id, role: invitation.role });
    carpool.currentCarpoolers += 1;

    // Remove the invitation after the user has joined
    carpool.invitations = carpool.invitations.filter(
      (invite) => invite.email !== req.user.email
    );

    await carpool.save();

    // Notify creator
    const message = `${req.user.email} has joined your carpool as a ${invitation.role}.`;
    await sendNotificationEmail(carpool.creator.email, message);

    res
      .status(200)
      .json({ message: "Successfully joined the carpool", carpool });
  } catch (error) {
    console.error("Error accepting invite and joining carpool:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Public Carpools
router.get("/public-carpools", authenticateUser, async (req, res) => {
  try {
    const publicCarpools = await Carpool.find({
      isPublic: true,
      status: "Upcoming",
    });
    res.status(200).json(publicCarpools);
  } catch (error) {
    console.error("Error fetching public carpools:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
