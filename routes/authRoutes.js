const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get current user (protected)
router.get("/current", auth, authController.getCurrentUser);

// Update profile (protected)
router.put("/update", auth, authController.updateProfile);

// Become a driver (protected)
router.post("/become-driver", auth, authController.becomeDriver);

module.exports = router;
