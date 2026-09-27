const express = require('express');
const router = express.Router();
const Showtime = require('../models/Showtime');
const SeatHold = require('../models/SeatHold');
const { authenticate, attachAppUser, isAdmin } = require('../middleware/auth');

// GET /api/showdays/:showdayId/showtimes - showtimes for a day
router.get('/showdays/:showdayId/showtimes', async (req, res) => {
  const showtimes = await Showtime.find({ showday: req.params.showdayId });
  res.json(showtimes);
});

// GET /api/showtimes/:id/seats - full seat status: booked (final) + held (temporary)
router.get('/showtimes/:id/seats', async (req, res) => {
  const showtime = await Showtime.findById(req.params.id);
  if (!showtime) return res.status(404).json({ message: 'الموعد غير موجود' });

  const activeHolds = await SeatHold.find({
    showtime: req.params.id,
    expiresAt: { $gt: new Date() },
  }).select('seat -_id');

  res.json({
    totalSeats: showtime.totalSeats,
    bookedSeats: showtime.bookedSeats, // confirmed, permanently closed
    heldSeats: activeHolds.map((h) => h.seat), // temporarily closed, may free up
  });
});

// POST /api/showdays/:showdayId/showtimes - admin only
router.post('/showdays/:showdayId/showtimes', authenticate, attachAppUser, isAdmin, async (req, res) => {
  const showtime = await Showtime.create({
    showday: req.params.showdayId,
    time: req.body.time,
    hall: req.body.hall,
    totalSeats: req.body.totalSeats,
  });
  res.status(201).json(showtime);
});

// DELETE /api/showtimes/:id - admin only
router.delete('/showtimes/:id', authenticate, attachAppUser, isAdmin, async (req, res) => {
  const showtime = await Showtime.findByIdAndDelete(req.params.id);
  if (!showtime) return res.status(404).json({ message: 'الموعد غير موجود' });
  res.json({ message: 'تم الحذف' });
});

module.exports = router;
