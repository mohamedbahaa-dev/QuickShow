const mongoose = require('mongoose');

const seatHoldSchema = new mongoose.Schema({
  showtime: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seat: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
});

// one hold per (showtime, seat) at a time
seatHoldSchema.index({ showtime: 1, seat: 1 }, { unique: true });

// MongoDB deletes the document automatically once expiresAt passes.
// No manual cleanup job or API call needed.
seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SeatHold', seatHoldSchema);
