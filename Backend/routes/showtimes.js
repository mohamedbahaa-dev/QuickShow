const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Showday = require("../models/Showday");
const Showtime = require("../models/Showtime");
const SeatHold = require("../models/SeatHold");
const { adminOnly } = require("../middleware/auth");

// POST /api/showdays/:showdayId/showtimes  (أدمن فقط)
router.post(
  "/showdays/:showdayId/showtimes",
  adminOnly,
  async (req, res) => {
    try {
      const { showdayId } = req.params;
      const input = req.body.showtimes;

      if (!mongoose.isValidObjectId(showdayId)) {
        return res.status(400).json({
          message: "Invalid showday ID",
        });
      }

      if (!Array.isArray(input) || input.length === 0) {
        return res.status(400).json({
          message: "Provide at least one showtime",
        });
      }

      const showday = await Showday.findById(showdayId);

      if (!showday) {
        return res.status(404).json({
          message: "Showday not found",
        });
      }

      const valid = input.every((item) => {
        return (
          item &&
          typeof item.time === "string" &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time) &&
          typeof item.hall === "string" &&
          item.hall.trim().length > 0 &&
          Number.isInteger(item.totalSeats) &&
          item.totalSeats > 0 &&
          Number.isFinite(Number(item.price)) &&
          Number(item.price) > 0
        );
      });

      if (!valid) {
        return res.status(400).json({
          message:
            "Every showtime needs a valid time, hall, seat count, and price",
        });
      }

      const showtimes = await Showtime.insertMany(
        input.map((item) => ({
          showday: showdayId,
          time: item.time,
          hall: item.hall.trim(),
          totalSeats: item.totalSeats,
          price: Number(item.price),
        }))
      );

      return res.status(201).json(showtimes);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Could not create showtimes",
      });
    }
  }
);

// GET /api/showdays/:showdayId/showtimes  (مفتوح للجميع)
router.get(
  "/showdays/:showdayId/showtimes",
  async (req, res) => {
    try {
      const { showdayId } = req.params;

      if (!mongoose.isValidObjectId(showdayId)) {
        return res.status(400).json({
          message: "Invalid showday ID",
        });
      }

      const showday = await Showday.findById(showdayId);

      if (!showday) {
        return res.status(404).json({
          message: "Showday not found",
        });
      }

      const showtimes = await Showtime.find({
        showday: showdayId,
      });

      return res.status(200).json(showtimes);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Could not get showtimes",
      });
    }
  }
);

// DELETE /api/showtimes/:id  (أدمن فقط)
router.delete("/showtimes/:id", adminOnly, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid showtime ID" });
    }

    const showtime = await Showtime.findByIdAndDelete(req.params.id);

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // نمسح حجوزات المقاعد المؤقتة المرتبطة بالموعد
    await SeatHold.deleteMany({ showtime: req.params.id });

    return res.json({ message: "تم الحذف" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Could not delete showtime" });
  }
});

module.exports = router;