require('dotenv').config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

//mongodb connection string
const uri = "mongodb+srv://igwenaguudochukwu:OEHkiDSKlAH84dKk@carpooling-cluster.wfjbu.mongodb.net/?retryWrites=true&w=majority&appName=carpooling-cluster"

// Initialize Express
const app = express();

// Middleware
app.use(express.json()); // For parsing JSON data
app.use(cors()); // Enable CORS

// Routes
app.use("/api/auth", authRoutes); // Authentication routes

// MongoDB Connection
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
