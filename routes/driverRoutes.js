const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET /drivers - admin only
router.get("/", auth, admin, driverController.getAllDrivers);

module.exports = router;
