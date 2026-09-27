require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { clerkMiddleware } = require('@clerk/express');

const movieRoutes = require('./routes/movies');
const showdayRoutes = require('./routes/showdays');
const showtimeRoutes = require('./routes/showtimes');
const bookingRoutes = require('./routes/bookings');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(clerkMiddleware()); // reads the Clerk session token on every request

app.use('/api/movies', movieRoutes);
app.use('/api', showdayRoutes);   // /api/movies/:movieId/showdays, /api/showdays/:id
app.use('/api', showtimeRoutes);  // /api/showdays/:showdayId/showtimes, /api/showtimes/:id/seats
app.use('/api', bookingRoutes);   // /api/holds, /api/bookings/confirm, /api/bookings/me

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
