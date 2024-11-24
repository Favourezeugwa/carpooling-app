const express = require("express");
const Carpool = require("../models/carpool");
const User = require("../models/user");
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
    isPublic,
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
      isPublic,
      pickupLocation,
      dropoffLocation,
      dateTime,
    });

    if (existingCarpool) {
      return res
        .status(400)
        .json({ message: "A carpool with these details already exists." });
    }

    // Remove any invitations that match the creator's email
    const filteredInvitations = invitations.filter(invite => invite.email !== req.user.email);

    // Create new carpool entry
    const newCarpool = new Carpool({
      creator: req.user._id, // ID of the authenticated user creating the carpool
      carpoolName,
      pickupLocation,
      dropoffLocation,
      dateTime,
      role,
      carType,
      isPublic,
      carpoolers: [{ user: req.user._id, role }], 
      maxCarpoolers,
      estimatedCost,
      specialNotes,
      invitations: filteredInvitations,
    });

    // Save the new carpool entry to the database
    await newCarpool.save();

    // Send invitation emails
    if (filteredInvitations && filteredInvitations.length > 0) {
      const emailPromises = filteredInvitations.map(async (invite) => {
        return sendInvitationEmail(invite.email, newCarpool._id); // Send invitation email
      });

      await Promise.all(emailPromises); // Ensure all emails are sent before sending response
    }

    res
      .status(201)
      .json({ message: "Carpool created successfully, invitations sent", carpool: newCarpool });
  } catch (error) {
    console.error("Error creating carpool:", error);
    console.log("Authenticated User:", req.user);
    res.status(500).json({ message: "Server error" });
  }
});

// Edit Carpool Route
router.put("/edit-carpool/:carpoolId", authenticateUser, async (req, res) => {
  const { carpoolId } = req.params;
  const {
    carpoolName,
    pickupLocation,
    dropoffLocation,
    dateTime,
    role,
    carType,
    isPublic,
    maxCarpoolers,
    estimatedCost,
    specialNotes,
    invitations,
  } = req.body;

  try {
    // Find the carpool by ID and verify the user is the creator
    const carpool = await Carpool.findOne({
      _id: carpoolId,
      creator: req.user._id,
    });
    if (!carpool) {
      return res.status(404).json({
        message: "Carpool not found or you're not authorized to edit this carpool",
      });
    }

    // Update the carpool fields
    carpool.carpoolName = carpoolName || carpool.carpoolName;
    carpool.pickupLocation = pickupLocation || carpool.pickupLocation;
    carpool.dropoffLocation = dropoffLocation || carpool.dropoffLocation;
    carpool.dateTime = dateTime || carpool.dateTime;
    carpool.role = role || carpool.role;
    carpool.carType = carType || carpool.carType;
    carpool.isPublic = isPublic || carpool.isPublic;
    carpool.maxCarpoolers = maxCarpoolers || carpool.maxCarpoolers;
    carpool.estimatedCost = estimatedCost || carpool.estimatedCost;
    carpool.specialNotes = specialNotes || carpool.specialNotes;

    // Filter out any invitations matching the creator's email
    const validInvitations = invitations.filter(invite => invite.email !== req.user.email);

    // Determine new invitees by checking against current invitations
    const existingInviteEmails = carpool.invitations.map(invite => invite.email);
    const newInvitations = validInvitations.filter(invite => !existingInviteEmails.includes(invite.email));

    // Update the invitations in the carpool
    carpool.invitations = validInvitations;

    // Send invitation emails to new invitees only
    const emailPromises = newInvitations.map(invite => sendInvitationEmail(invite.email, carpool._id));
    await Promise.all(emailPromises);

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
  let { role } = req.body; // Role can be 'Rider' or 'Driver'

  try {
    const carpool = await Carpool.findById(carpoolId);

    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Check if the user is the creator of the carpool
    if (carpool.creator.equals(req.user._id)) {
      return res.status(400).json({ message: "You cannot join your own carpool." });
    }

    // Check if maxCarpoolers limit is reached
    if (carpool.currentCarpoolers >= carpool.maxCarpoolers) {
      return res.status(400).json({ message: "This carpool has reached its maximum capacity" });
    }

    // Check if the user is already in the carpool
    const isAlreadyInCarpool = carpool.carpoolers.some((carpooler) =>
      carpooler.user.equals(req.user._id)
    );

    if (isAlreadyInCarpool) {
      return res.status(400).json({ message: "You are already part of this carpool" });
    }

    // For public carpools, allow joining without an invitation
    if (carpool.isPublic) {
      if (!role) role = 'Rider'; // Default role if none provided
    } else {
      // For private carpools, check if the user has an invitation
      const invitation = carpool.invitations.find(
        (invite) => invite.email === req.user.email
      );

      if (!invitation) {
        return res.status(403).json({ message: "You are not invited to join this carpool" });
      }

      // If no role specified in request, use the invited role
      if (!role) role = invitation.role;

      // Remove the user from the invitations array
      carpool.invitations = carpool.invitations.filter(
        (invite) => invite.email !== req.user.email
      );
    }

    // Add the user to carpoolers array with the specified or default role
    carpool.carpoolers.push({ user: req.user._id, role });
    carpool.currentCarpoolers += 1;

    await carpool.save();

    // Notify creator
    const message = `${req.user.username} has joined your carpool as a ${role}.`;
    const creator = await User.findById(carpool.creator);
    if (creator) {
      const creatorEmail = creator.email;
      await sendNotificationEmail(creatorEmail, message);
    } else {
      console.error("Creator not found for carpool:", carpoolId);
    }

    res.status(200).json({ message: "Successfully joined the carpool", carpool });
  } catch (error) {
    console.error("Error joining carpool:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Decline Carpool Invitation
router.post("/decline-invite/:carpoolId", authenticateUser, async (req, res) => {
  const { carpoolId } = req.params;

  try {
    const carpool = await Carpool.findById(carpoolId);

    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Check if the user has been invited to this carpool
    const invitationIndex = carpool.invitations.findIndex(
      (invite) => invite.email === req.user.email
    );

    if (invitationIndex === -1) {
      return res.status(400).json({ message: "No invitation found for this carpool" });
    }

    // Remove the invitation
    carpool.invitations.splice(invitationIndex, 1);
    await carpool.save();

    // Notify creator
    const message = `${req.user.username} has declined your carpool Invite.`;
    const creator = await User.findById(carpool.creator); // Corrected line
    if (creator) {
      const creatorEmail = creator.email;
      await sendNotificationEmail(creatorEmail, message);
    } else {
      console.error("Creator not found for carpool:", carpoolId);
    }

    res.status(200).json({ message: "Invitation declined successfully" });
  } catch (error) {
    console.error("Error declining invitation:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Leave Carpool Route
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
      return res.status(400).json({ message: "Creator cannot leave their own carpool. Use the cancel option instead." });
    }

    // Remove the user from the `carpoolers` array
    const initialCarpoolersCount = carpool.carpoolers.length;
    carpool.carpoolers = carpool.carpoolers.filter(
      (carpooler) => !carpooler.user.equals(req.user._id)
    );

    // Check if the user was actually in the carpool
    if (carpool.carpoolers.length === initialCarpoolersCount) {
      return res.status(400).json({ message: "User is not part of this carpool" });
    }

    // Decrement the currentCarpoolers count
    carpool.currentCarpoolers -= 1;

    // Save the updated carpool document
    await carpool.save();

    // Notify creator
    const message = `${req.user.username} has left your carpool.`;
    const creator = await User.findById(carpool.creator);
    if (creator) {
      const creatorEmail = creator.email;
      await sendNotificationEmail(creatorEmail, message);
    } else {
      console.error("Creator not found for carpool:", carpoolId);
    }

    res.status(200).json({ message: "Successfully left the carpool", carpool });
  } catch (error) {
    console.error("Error leaving carpool:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel Carpool Route (for the creator only)
router.post("/cancel-carpool/:carpoolId", authenticateUser, async (req, res) => {
  const { carpoolId } = req.params;

  try {
    // Find the carpool
    const carpool = await Carpool.findById(carpoolId);

    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Check if the user is the creator of the carpool
    if (!carpool.creator.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the creator can cancel this carpool" });
    }

    // Update the status to "Canceled"
    carpool.status = "Canceled";

    // Save the updated carpool document
    await carpool.save();

    res.status(200).json({ message: "Carpool successfully canceled", carpool });
  } catch (error) {
    console.error("Error canceling carpool:", error);
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
      const carpool = await Carpool.findById(carpoolId).populate("carpoolers.user", "email");

      if (!carpool) {
        return res.status(404).json({ message: "Carpool not found" });
      }

      // Check if the user is the creator of the carpool
      if (!carpool.creator.equals(req.user._id)) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this carpool" });
      }

      // Send Notifications to other carpoolers
      const message = `${req.user.username} has deleted the ${carpool.carpoolName} carpool.`;
      
      // Filter out the creator's email and notify other carpoolers
      const emailPromises = carpool.carpoolers
        .filter(carpooler => !carpooler.user._id.equals(carpool.creator))
        .map(async carpooler => {
          return sendNotificationEmail(carpooler.user.email, message);
        });

      await Promise.all(emailPromises);

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
  
  // // Get Public Carpools
  // router.get('/public-carpools', authenticateUser, async (req, res) => {
  //   try {
  //     const publicCarpools = await Carpool.find({ isPublic: true, status: 'Upcoming' });
  //     res.status(200).json(publicCarpools);
  //   } catch (error) {
  //     console.error("Error fetching public carpools:", error);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // });

  // Show User's Upcoming and Active Carpools
  router.get('/show-user-carpools', authenticateUser, async (req, res) => {
    try {
      const userId = req.user._id;

      // Find carpools where the user is either a creator, a driver, or a rider and the status is "Upcoming" or "Active"
      const userCarpools = await Carpool.find({
        $or: [
          { creator: userId },
          { 'carpoolers.user': userId }
        ],
        status: { $in: ['Upcoming', 'Active'] }
      });

      res.status(200).json({ carpools: userCarpools });
    } catch (error) {
      console.error("Error fetching carpools:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Route to get all invitations for a specific user
  router.get("/user-invitations", authenticateUser, async (req, res) => {
    try {
      const invitations = await Carpool.find({
        "invitations.email": req.user.email, // Match email with authenticated user's email
      });

      const userInvitations = invitations.map((carpool) => {
        // Find the specific invitation for the current user and get their role
        const userInvitation = carpool.invitations.find(
          (invite) => invite.email === req.user.email
        );

        return {
          _id: carpool._id,
          carpoolName: carpool.carpoolName,
          pickupLocation: carpool.pickupLocation,
          dropoffLocation: carpool.dropoffLocation,
          dateTime: carpool.dateTime,
          carType: carpool.carType,
          maxCarpoolers: carpool.maxCarpoolers,
          currentCarpoolers: carpool.currentCarpoolers,
          estimatedCost: carpool.estimatedCost,
          specialNotes: carpool.specialNotes,
          invitationRole: userInvitation ? userInvitation.role : null, // Include the role for this user
        };
      });

      res.status(200).json({ carpools: userInvitations });
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Route to get public carpools
  router.get('/public-carpools', authenticateUser, async (req, res) => {
    try {
      const publicCarpools = await Carpool.find({
        isPublic: true,
        status: 'Upcoming'
      }).populate('creator', 'email').populate('carpoolers.user', 'email');
      
      res.status(200).json({ carpools: publicCarpools });
    } catch (error) {
      console.error("Error fetching public carpools:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  module.exports = router;