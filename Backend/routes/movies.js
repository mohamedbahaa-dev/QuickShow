const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { authenticate, attachAppUser, isAdmin } = require('../middleware/auth');

// GET /api/movies - public listing for the site
router.get('/', async (req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.json(movies);
});

// GET /api/movies/:id - single movie details
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
  res.json(movie);
});

// POST /api/movies - admin only, adds a movie to be listed on the site
router.post('/', async (req, res) => {
  const movie = await Movie.create(req.body);
  res.status(201).json(movie);
});
// PUT /api/movies/:id - admin only
router.put('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
  res.json(movie);
});

// DELETE /api/movies/:id - admin only
router.delete('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
  res.json({ message: 'تم الحذف' });
});

module.exports = router;
