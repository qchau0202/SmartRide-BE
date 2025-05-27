const User = require("../models/User");
const Customer = require("../models/Customer");
const Driver = require("../models/Driver");
const Car = require("../models/Car");
const jwt = require("jsonwebtoken");

// Register new user
exports.register = async (req, res) => {
  try {
    let { name, email, phone, password, role } = req.body;
    role = role || "customer";

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password,
      role,
    });

    await user.save();

    // Create role-specific document
    if (role === "customer") {
      const customer = new Customer({
        user: user._id,
      });
      await customer.save();
    } else if (role === "driver") {
      // For demo, create a default car
      const car = new Car({
        model: "Default Car",
        color: "Black",
        licensePlate: "DEMO-123",
        type: "sedan",
        seats: 4,
      });
      await car.save();

      const driver = new Driver({
        user: user._id,
        car: car._id,
        rating: 0,
        totalRides: 0,
        earnings: {
          perRide: 0,
          total: 0,
        },
      });
      await driver.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Simple password check for demo
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === "customer") {
      roleData = await Customer.findOne({ user: user._id });
    } else if (user.role === "driver") {
      roleData = await Driver.findOne({ user: user._id }).populate("car");
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
      roleData,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Error getting user data" });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, avatar } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (avatar) updateFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Become a driver
exports.becomeDriver = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { model, color, licensePlate, type, seats } = req.body;
    // Validate required fields
    if (!model || !color || !licensePlate || !type || !seats) {
      return res.status(400).json({ message: "All car details are required" });
    }
    // Update user role
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role: "driver" } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Create car
    const car = new Car({ model, color, licensePlate, type, seats });
    await car.save();
    // Create driver
    const driver = new Driver({
      user: user._id,
      car: car._id,
      rating: 0,
      totalRides: 0,
      earnings: { perRide: 0, total: 0 },
    });
    await driver.save();
    res.json({
      message: "You are now a driver!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Become driver error:", error);
    res.status(500).json({ message: "Error becoming driver" });
  }
};
