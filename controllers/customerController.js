const Customer = require("../models/Customer");

// GET /customers - get all customers (admin)
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("user");
    res.json({ customers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
