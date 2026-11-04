const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Movie = require('../models/Movie');
const { adminOnly } = require('../middleware/auth');

// نتأكد إن فولدر uploads موجود
fs.mkdirSync('uploads', { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Images only')),
});

// GET /api/movies  ← مفتوح للجميع
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/:id  ← مفتوح للجميع
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/movies  ← أدمن فقط
router.post('/', adminOnly, upload.single('posterUrl'), async (req, res) => {
  try {
    const movie = await Movie.create({
      ...req.body,
      posterUrl: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : '',
    });
    res.status(201).json(movie);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/movies/:id  ← أدمن فقط
router.put('/:id', adminOnly, upload.single('posterUrl'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.posterUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/movies/:id  ← أدمن فقط
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
    res.json({ message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;