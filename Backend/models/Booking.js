const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seats: { type: [String], required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
