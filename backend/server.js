const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth"); // We'll create this in a bit

// Initialize Express
const app = express();

// Middleware
app.use(bodyParser.json()); // For parsing JSON data
app.use(cors()); // Enable CORS

// Routes
app.use("/api/auth", authRoutes); // Authentication routes

// MongoDB Connection
mongoose
  .connect("your-mongodb-connection-string", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
