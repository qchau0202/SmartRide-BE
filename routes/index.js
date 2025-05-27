const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const rideRoutes = require("./rideRoutes");
const paymentRoutes = require("./paymentRoutes");
const customerRoutes = require("./customerRoutes");
const driverRoutes = require("./driverRoutes");

// Use routes
router.use("/auth", authRoutes);
router.use("/rides", rideRoutes);
router.use("/payments", paymentRoutes);
router.use("/customers", customerRoutes);
router.use("/drivers", driverRoutes);


module.exports = router;