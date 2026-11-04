const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    posterUrl: { type: String },
    duration: { type: Number }, // minutes
    genre: { type: String },
    language: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
