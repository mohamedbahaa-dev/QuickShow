
const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema(
  {
    showday: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showday",
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    hall: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Showtime", showtimeSchema);
