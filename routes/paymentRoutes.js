const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");

// Create payment
router.post("/", auth, paymentController.createPayment);
// Get all payments
router.get("/", auth, paymentController.getPayments);
// Get payment by id
router.get("/:id", auth, paymentController.getPaymentById);
// Delete payment
router.delete("/:id", auth, paymentController.deletePayment);
// (Optional) Update payment
// router.put("/:id", paymentController.updatePayment);

module.exports = router;
