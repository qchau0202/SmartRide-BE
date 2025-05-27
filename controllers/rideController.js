const Ride = require("../models/Ride");
const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const mongoose = require("mongoose");
const Driver = require("../models/Driver");

// POST /rides - Book a new ride
exports.bookRide = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pickup, dropoff, datetime, paymentMethod, fare } = req.body;
    if (!pickup || !dropoff || !datetime || !paymentMethod || !fare) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Find customer by userId
    const customer = await Customer.findOne({ user: userId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    // Create ride
    const ride = new Ride({
      customer: customer._id,
      pickup,
      dropoff,
      datetime,
      fare,
      paymentMethod,
      status: "pending",
    });
    await ride.save();
    res.status(201).json({ message: "Ride booked successfully", ride });
  } catch (error) {
    console.error("Book ride error:", error);
    res.status(500).json({ message: "Error booking ride" });
  }
};

// GET /rides - List all rides (for drivers)
exports.getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate({
        path: "customer",
        populate: { path: "user", select: "name avatar email" },
      })
      .populate({
        path: "driver",
        populate: { path: "user", select: "name avatar email" },
      })
      .sort({ createdAt: -1 });
    res.json({ rides });
  } catch (error) {
    console.error("Get all rides error:", error);
    res.status(500).json({ message: "Error fetching rides" });
  }
};

// PATCH /rides/:id/accept - Accept a ride as a driver
exports.acceptRide = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rideId = req.params.id;

    // Find the Driver document for this user
    const driver = await Driver.findOne({ user: userId });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    if (ride.status !== "pending") {
      return res.status(400).json({ message: "Ride is not pending" });
    }
    ride.status = "accepted";
    ride.driver = driver._id; // Set to Driver's _id, not User's _id
    await ride.save();
    res.json({ message: "Ride accepted", ride });
  } catch (error) {
    console.error("Accept ride error:", error);
    res.status(500).json({ message: "Error accepting ride" });
  }
};

// PATCH /rides/:id/reject - Reject a ride as a driver
exports.rejectRide = async (req, res) => {
  try {
    const driverId = req.user.userId;
    const rideId = req.params.id;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    if (ride.status !== "pending") {
      return res.status(400).json({ message: "Ride is not pending" });
    }
    ride.status = "rejected";
    ride.driver = driverId;
    await ride.save();
    res.json({ message: "Ride rejected", ride });
  } catch (error) {
    console.error("Reject ride error:", error);
    res.status(500).json({ message: "Error rejecting ride" });
  }
};

// GET /rides/history - Get all rides for the current user (customer)
exports.getUserRides = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rides = await Ride.find()
      .populate({
        path: "customer",
        match: { user: userId },
        populate: { path: "user", select: "name avatar email" },
      })
      .populate({
        path: "driver",
        populate: { path: "user", select: "name avatar email" },
      })
      .populate("payment")
      .sort({ createdAt: -1 });
    // Only include rides where customer is not null (matched)
    const userRides = rides.filter((r) => r.customer);
    res.json({ rides: userRides });
  } catch (error) {
    console.error("Get user rides error:", error);
    res.status(500).json({ message: "Error fetching user rides" });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rideId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ message: "Invalid ride ID format" });
    }

    const ride = await Ride.findById(rideId)
      .populate({
        path: "customer",
        populate: { path: "user", select: "name avatar email" },
      })
      .populate({
        path: "driver",
        populate: [
          { path: "user", select: "name avatar email phone" },
          { path: "car" },
        ],
      })
      .populate("payment");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Check if user is authorized to view this ride
    const isCustomer = ride.customer?.user?._id.toString() === userId;
    const isDriver = ride.driver?.user?._id.toString() === userId;

    if (!isCustomer && !isDriver) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this ride" });
    }

    res.json({ ride });
  } catch (error) {
    console.error("Get ride by id error:", error);
    res.status(500).json({ message: "Error fetching ride details" });
  }
};

// PATCH /rides/:id/arrive - Mark ride as onGoing (driver arrived)
exports.arriveRide = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rideId = req.params.id;
    const driver = await Driver.findOne({ user: userId });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    if (!ride.driver || ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this ride" });
    }
    if (ride.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "Ride is not in accepted status" });
    }
    ride.status = "onGoing";
    await ride.save();
    const populatedRide = await Ride.findById(rideId)
      .populate({
        path: "customer",
        populate: { path: "user", select: "name avatar email" },
      })
      .populate({
        path: "driver",
        populate: [
          { path: "user", select: "name avatar email phone" },
          { path: "car" },
        ],
      })
      .populate("payment");
    res.json({ message: "Ride is now on-going", ride: populatedRide });
  } catch (error) {
    console.error("Arrive ride error:", error);
    res.status(500).json({ message: "Error updating ride status to on-going" });
  }
};

// PATCH /rides/:id/complete - Mark ride as completed
exports.completeRide = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rideId = req.params.id;
    const driver = await Driver.findOne({ user: userId });
    if (!driver) {
      return res.status(404).json({ message: "Driver profile not found" });
    }
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    if (!ride.driver || ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ message: "Not authorized for this ride" });
    }
    if (ride.status !== "onGoing") {
      return res.status(400).json({ message: "Ride is not on-going" });
    }
    ride.status = "completed";
    await ride.save();

    // If payment method is cash, update driver earnings and total rides
    if (ride.paymentMethod === "cash") {
      await Driver.findByIdAndUpdate(ride.driver, {
        $inc: {
          totalRides: 1,
          "earnings.total": ride.fare,
          "earnings.perRide": ride.fare,
        },
      });
    }

    // Update customer's rideHistory
    await Customer.findByIdAndUpdate(ride.customer, {
      $addToSet: { rideHistory: ride._id },
    });

    const populatedRide = await Ride.findById(rideId)
      .populate({
        path: "customer",
        populate: { path: "user", select: "name avatar email" },
      })
      .populate({
        path: "driver",
        populate: [
          { path: "user", select: "name avatar email phone" },
          { path: "car" },
        ],
      })
      .populate("payment");
    res.json({ message: "Ride completed", ride: populatedRide });
  } catch (error) {
    console.error("Complete ride error:", error);
    res
      .status(500)
      .json({ message: "Error updating ride status to completed" });
  }
};
