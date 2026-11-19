require("dotenv").config();

const path = require("path");
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

// FRONTEND_URL ممكن يكون أكتر من رابط مفصولين بفاصلة، مثال:
// FRONTEND_URL=http://localhost:5173,https://quickshow.vercel.app
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // طلبات من غير origin (Postman / Paymob webhook) نسمح بيها
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
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

// فحص سريع لـ Render (Health Check)
app.get("/", (req, res) => res.json({ status: "ok", service: "QuickShow API" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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