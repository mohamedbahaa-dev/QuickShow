const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    showday: { type: mongoose.Schema.Types.ObjectId, ref: 'Showday', required: true },
    time: { type: String, required: true }, // "18:30"
    hall: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    // seats that are PERMANENTLY booked (after successful payment)
    bookedSeats: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Showtime', showtimeSchema);
