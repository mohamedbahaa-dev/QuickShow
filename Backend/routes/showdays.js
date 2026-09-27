const express = require('express');
const router = express.Router();
const Showday = require('../models/Showday');
const { authenticate, attachAppUser, isAdmin } = require('../middleware/auth');

// GET /api/movies/:movieId/showdays - available booking days for a movie
router.get('/movies/:movieId/showdays', async (req, res) => {
  const showdays = await Showday.find({ movie: req.params.movieId }).sort({ date: 1 });
  res.json(showdays);
});

// POST /api/movies/:movieId/showdays - admin only, add a day the movie is showing
router.post('/movies/:movieId/showdays', authenticate, attachAppUser, isAdmin, async (req, res) => {
  const showday = await Showday.create({
    movie: req.params.movieId,
    date: req.body.date,
  });
  res.status(201).json(showday);
});

// DELETE /api/showdays/:id - admin only
router.delete('/showdays/:id', authenticate, attachAppUser, isAdmin, async (req, res) => {
  const showday = await Showday.findByIdAndDelete(req.params.id);
  if (!showday) return res.status(404).json({ message: 'اليوم غير موجود' });
  res.json({ message: 'تم الحذف' });
});

module.exports = router;
