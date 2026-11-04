require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { clerkMiddleware } = require("@clerk/express");

const movieRoutes = require("./routes/movies");
const showdayRoutes = require("./routes/showdays");
const showtimeRoutes = require("./routes/showtimes");
const bookingRoutes = require("./routes/bookings");
const meRoutes = require("./routes/me");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/movies", movieRoutes);
app.use("/api", showdayRoutes);
app.use("/api", showtimeRoutes);
app.use("/api", bookingRoutes);
app.use("/api", meRoutes);
app.use("/api/admin", adminRoutes);

app.use("/uploads", express.static("uploads"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });