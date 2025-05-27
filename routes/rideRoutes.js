const express = require("express");
const router = express.Router();
const {
  bookRide,
  getAllRides,
  acceptRide,
  rejectRide,
  getUserRides,
  getRideById,
  arriveRide,
  completeRide,
} = require("../controllers/rideController");
const auth = require("../middleware/auth");

// POST /rides
router.post("/", auth, bookRide);
// GET /rides
router.get("/", auth, getAllRides);
// PATCH /rides/:id/accept
router.patch("/:id/accept", auth, acceptRide);
// PATCH /rides/:id/reject
router.patch("/:id/reject", auth, rejectRide);
// GET /rides/history
router.get("/history", auth, getUserRides);
// GET /rides/:id
router.get("/:id", auth, getRideById);
// PATCH /rides/:id/arrive
router.patch("/:id/arrive", auth, arriveRide);
// PATCH /rides/:id/complete
router.patch("/:id/complete", auth, completeRide);

module.exports = router;
