const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    licensePlate: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["sedan", "suv", "van"],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 2,
      max: 7,
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
