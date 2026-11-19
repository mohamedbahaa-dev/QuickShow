
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const Movie = require('../models/Movie');
const { adminOnly } = require('../middleware/auth');

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Multer stores images in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Images only')),
});

// 3. Upload image to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'quickshow/movies',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

// 4. Convert movie to normal object
const withPoster = (movie) => {
  return movie.toObject ? movie.toObject() : movie;
};

// GET /api/movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    res.json(movies.map(withPoster));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'الفيلم غير موجود' });
    }

    res.json(withPoster(movie));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/movies
router.post(
  '/',
  adminOnly,
  upload.single('posterUrl'),
  async (req, res) => {
    try {
      const posterUrl = req.file
        ? await uploadToCloudinary(req.file.buffer)
        : '';

      const movie = await Movie.create({
        ...req.body,
        posterUrl,
      });

      res.status(201).json(withPoster(movie));
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /api/movies/:id
router.put(
  '/:id',
  adminOnly,
  upload.single('posterUrl'),
  async (req, res) => {
    try {
      const data = { ...req.body };

      if (req.file) {
        data.posterUrl = await uploadToCloudinary(req.file.buffer);
      }

      const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        data,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!movie) {
        return res.status(404).json({ message: 'الفيلم غير موجود' });
      }

      res.json(withPoster(movie));
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE /api/movies/:id
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'الفيلم غير موجود' });
    }

    res.json({ message: 'تم الحذف' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
