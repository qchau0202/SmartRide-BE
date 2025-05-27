const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET /customers - admin only
router.get("/", auth, admin, customerController.getAllCustomers);

module.exports = router;
