const Payment = require("../models/Payment");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      customer: req.user.userId,
    };
    const payment = new Payment(paymentData);
    await payment.save();

    // Update the ride to reference this payment
    await Ride.findByIdAndUpdate(payment.booking, { payment: payment._id });

    // Update driver stats
    const ride = await Ride.findById(payment.booking);
    if (ride && ride.driver) {
      await Driver.findByIdAndUpdate(ride.driver, {
        $inc: {
          totalRides: 1,
          "earnings.total": ride.fare,
          "earnings.perRide": ride.fare, // or set to ride.fare if you want to reset perRide each time
        },
      });
    }

    res.status(201).json({ payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payment by id
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json({ message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
