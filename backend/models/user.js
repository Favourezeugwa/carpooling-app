const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['rider', 'driver'] },
  otp: { type: String }, // Store OTP (hashed)
  otpExpiresAt: { type: Date }, // OTP expiration time
  isVerified: { type: Boolean, default: false }, // Track if the user is verified
});

module.exports = mongoose.model("user", userSchema);
