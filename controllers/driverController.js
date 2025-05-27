const Driver = require("../models/Driver");

// GET /drivers - get all drivers (admin)
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate("user").populate("car");
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
