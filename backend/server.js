require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const carpoolRoutes = require("./routes/carpoolRoutes")

// //mongodb connection string from .env
const uri = process.env.URI;

// Initialize Express
const app = express();

// Middleware
app.use(express.json()); // For parsing JSON data
app.use(cors()); // Enable CORS

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/carpool", carpoolRoutes); // Carpool routes 

// MongoDB Connection
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
