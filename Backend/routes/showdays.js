const express = require('express');
const router = express.Router();
const Showday = require('../models/Showday');
const { adminOnly } = require('../middleware/auth');

// GET /api/movies/:movieId/showdays - مفتوح للجميع
router.get('/movies/:movieId/showdays', async (req, res) => {
  const showdays = await Showday.find({ movie: req.params.movieId }).sort({ date: 1 });
  res.json(showdays);
});

// POST /api/movies/:movieId/showdays - أدمن فقط
router.post('/movies/:movieId/showdays', adminOnly, async (req, res) => {
  const showday = await Showday.create({
    movie: req.params.movieId,
    date: req.body.date,
  });
  res.status(201).json(showday);
});

// DELETE /api/showdays/:id - أدمن فقط
router.delete('/showdays/:id', adminOnly, async (req, res) => {
  const showday = await Showday.findByIdAndDelete(req.params.id);
  if (!showday) return res.status(404).json({ message: 'اليوم غير موجود' });
  res.json({ message: 'تم الحذف' });
});

module.exports = router;