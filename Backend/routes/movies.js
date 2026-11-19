const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Movie = require('../models/Movie');
const { adminOnly } = require('../middleware/auth');

// رابط الـ Backend العام (من الـ env) — محلي: http://localhost:5000 / لايف: رابط Render
const BASE_URL = (
  process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`
).replace(/\/+$/, '');

// نتأكد إن فولدر uploads موجود
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// أي صورة قديمة متخزنة برابط localhost نحوّلها لرابط السيرفر الحالي
const withPoster = (movie) => {
  const obj = movie.toObject ? movie.toObject() : movie;
  if (obj.posterUrl) {
    obj.posterUrl = obj.posterUrl.replace(/^https?:\/\/localhost:\d+/, BASE_URL);
  }
  return obj;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
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
    res.json(movies.map(withPoster));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/:id  ← مفتوح للجميع
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
    res.json(withPoster(movie));
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
        ? `${BASE_URL}/uploads/${req.file.filename}`
        : '',
    });
    res.status(201).json(withPoster(movie));
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
      data.posterUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    }
    const movie = await Movie.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!movie) return res.status(404).json({ message: 'الفيلم غير موجود' });
    res.json(withPoster(movie));
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