const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const SeatHold = require('../models/SeatHold');
const Booking = require('../models/Booking');
const { authenticate, attachAppUser } = require('../middleware/auth');

const HOLD_MINUTES = Number(process.env.HOLD_DURATION_MINUTES || 5);

// POST /api/holds - temporarily hold seats while the user pays
// This is what runs the instant a seat is clicked, not just a frontend color change.
router.post('/holds', authenticate, attachAppUser, async (req, res) => {
  const { showtimeId, seats } = req.body;
  if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ message: 'بيانات ناقصة' });
  }

  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

  try {
    // insertMany fails atomically per-document if the unique (showtime, seat)
    // index is violated - i.e. someone else already holds that seat.
    const holds = seats.map((seat) => ({
      showtime: showtimeId,
      seat,
      user: req.appUser._id,
      expiresAt,
    }));
    await SeatHold.insertMany(holds, { ordered: true });
    res.status(201).json({ expiresAt });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'بعض الكراسي محجوزة مؤقتًا من حد تاني' });
    }
    res.status(500).json({ message: 'حصل خطأ، حاول تاني' });
  }
});

// POST /api/bookings/confirm - final confirmation after payment succeeds
router.post('/bookings/confirm', authenticate, attachAppUser, async (req, res) => {
  const { showtimeId, seats, totalPrice } = req.body;

  // 1. Make sure the user still holds all these seats and the hold hasn't expired
  const validHolds = await SeatHold.find({
    showtime: showtimeId,
    seat: { $in: seats },
    user: req.appUser._id,
    expiresAt: { $gt: new Date() },
  });

  if (validHolds.length !== seats.length) {
    return res.status(410).json({ message: 'انتهت مهلة الحجز لبعض الكراسي، حاول تاني' });
  }

  // 2. Atomically move seats into the permanent bookedSeats array.
  // The $nin condition guards against any edge-case overlap with an already
  // confirmed booking, even though the hold step above should prevent it.
  const updated = await Showtime.findOneAndUpdate(
    { _id: showtimeId, bookedSeats: { $nin: seats } },
    { $push: { bookedSeats: { $each: seats } } },
    { new: true }
  );

  if (!updated) {
    return res.status(409).json({ message: 'بعض الكراسي اتحجزت بالفعل' });
  }

  // 3. Clean up the holds and create the booking record
  await SeatHold.deleteMany({ showtime: showtimeId, seat: { $in: seats } });
  const booking = await Booking.create({
    showtime: showtimeId,
    user: req.appUser._id,
    seats,
    totalPrice,
    status: 'confirmed',
  });

  res.status(201).json({ success: true, booking });
});

// GET /api/bookings/me - the logged-in user's booking history
router.get('/bookings/me', authenticate, attachAppUser, async (req, res) => {
  const bookings = await Booking.find({ user: req.appUser._id })
    .populate('showtime')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

module.exports = router;
