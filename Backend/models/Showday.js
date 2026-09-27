const mongoose = require('mongoose');

const showdaySchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

// prevent duplicate days for the same movie
showdaySchema.index({ movie: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Showday', showdaySchema);
