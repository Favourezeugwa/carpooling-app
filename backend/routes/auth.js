const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendOtpEmail } = require("../otpemailservice");
const crypto = require("crypto");

const router = express.Router();

// Load environment variables
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET; // Use the JWT_SECRET from .env

// Generate a random 6-digit OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the email is from the @pvamu.edu domain
  const pvamuDomain = /@pvamu\.edu$/;
  if (!pvamuDomain.test(email)) {
    return res
      .status(400)
      .json({ message: "Only @pvamu.edu emails are allowed." });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate and hash OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Create new user with OTP and expiration time
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000, // OTP valid for 5 minutes
    });

    // Save the new user to the database
    await newUser.save();

    // Send OTP to the user's email
    await sendOtpEmail(email, otp);

    res.status(201).json({
      message:
        "Signup successful. Please verify your email with the OTP sent to you.",
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error or email does not exist" });
  }
});

// otp verification Route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is verified" });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    // Verify the OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark the user as verified and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "OTP verified successfully. You can now log in." });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//resend otp route
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is verified" });
    }

    // Generate a new OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update OTP and expiration time
    user.otp = hashedOtp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000; // Valid for 5 minutes
    await user.save();

    // Send the new OTP to the user's email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Sign and return a JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
