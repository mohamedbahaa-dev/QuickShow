
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const crypto = require("crypto");

const router = express.Router();

const Showtime = require("../models/Showtime");
const SeatHold = require("../models/SeatHold");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const {
  authenticate,
  attachAppUser,
} = require("../middleware/auth");

const HOLD_MINUTES = Number(
  process.env.HOLD_DURATION_MINUTES || 10
);

const PAYMOB_BASE_URL = (
  process.env.PAYMOB_BASE_URL || "https://accept.paymob.com"
).replace(/\/+$/, "");

function parseSeats(input) {
  return []
    .concat(input || [])
    .join(",")
    .split(/[,\s]+/)
    .map((seat) => seat.trim().toUpperCase())
    .filter(Boolean);
}

// GET /api/showtimes/:id/seats
router.get(
  "/showtimes/:id/seats",
  authenticate,
  attachAppUser,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid showtime ID",
        });
      }

      const showtime = await Showtime.findById(
        req.params.id
      ).select("bookedSeats");

      if (!showtime) {
        return res.status(404).json({
          message: "Showtime not found",
        });
      }

      const holds = await SeatHold.find({
        showtime: req.params.id,
        expiresAt: { $gt: new Date() },
      }).select("seat user expiresAt");

      const mine = holds.filter((hold) =>
        hold.user.equals(req.appUser._id)
      );

      const others = holds.filter(
        (hold) => !hold.user.equals(req.appUser._id)
      );

      const myExpiresAt = mine.length
        ? new Date(
            Math.min(
              ...mine.map((hold) =>
                hold.expiresAt.getTime()
              )
            )
          )
        : null;

      return res.json({
        bookedSeats: parseSeats(showtime.bookedSeats),
        heldByMe: mine.map((hold) => hold.seat),
        heldByOthers: others.map((hold) => hold.seat),
        myExpiresAt,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// POST /api/holds
router.post(
  "/holds",
  authenticate,
  attachAppUser,
  async (req, res) => {
    try {
      const { showtimeId, seats } = req.body;

      if (
        !mongoose.isValidObjectId(showtimeId) ||
        !Array.isArray(seats) ||
        seats.length === 0
      ) {
        return res.status(400).json({
          message: "Invalid booking data",
        });
      }

      const uniqueSeats = [
        ...new Set(
          seats.map((seat) =>
            String(seat).trim().toUpperCase()
          )
        ),
      ];

      if (
        uniqueSeats.length !== seats.length ||
        uniqueSeats.some(
          (seat) => !/^[A-J][1-9]$/.test(seat)
        )
      ) {
        return res.status(400).json({
          message: "Invalid seat numbers",
        });
      }

      const userId = req.appUser._id;
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + HOLD_MINUTES * 60 * 1000
      );

      await SeatHold.deleteMany({
        showtime: showtimeId,
        expiresAt: { $lte: now },
      });

      const showtime = await Showtime.findById(
        showtimeId
      ).select("bookedSeats");

      if (!showtime) {
        return res.status(404).json({
          message: "Showtime not found",
        });
      }

      const bookedSeats = parseSeats(
        showtime.bookedSeats
      );

      const alreadyBooked = uniqueSeats.filter(
        (seat) => bookedSeats.includes(seat)
      );

      if (alreadyBooked.length) {
        return res.status(409).json({
          message: "Some seats are already booked",
          seats: alreadyBooked,
        });
      }

      const heldByOthers = await SeatHold.find({
        showtime: showtimeId,
        seat: { $in: uniqueSeats },
        user: { $ne: userId },
        expiresAt: { $gt: now },
      }).select("seat");

      if (heldByOthers.length) {
        return res.status(409).json({
          message: "Some seats are held by another user",
          seats: heldByOthers.map((hold) => hold.seat),
        });
      }

      await SeatHold.bulkWrite(
        uniqueSeats.map((seat) => ({
          updateOne: {
            filter: {
              showtime: showtimeId,
              seat,
              user: userId,
            },
            update: {
              $set: { expiresAt },
            },
            upsert: true,
          },
        }))
      );

      return res.status(201).json({ expiresAt });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "A seat was just held by another user",
        });
      }

      console.error(error);

      return res.status(500).json({
        message: "Could not hold seats",
      });
    }
  }
);

// DELETE /api/holds/:showtimeId/:seat
router.delete(
  "/holds/:showtimeId/:seat",
  authenticate,
  attachAppUser,
  async (req, res) => {
    try {
      await SeatHold.deleteOne({
        showtime: req.params.showtimeId,
        seat: req.params.seat.toUpperCase(),
        user: req.appUser._id,
      });

      return res.json({ ok: true });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Could not release seat",
      });
    }
  }
);

// DELETE /api/holds/:showtimeId
router.delete(
  "/holds/:showtimeId",
  authenticate,
  attachAppUser,
  async (req, res) => {
    try {
      await SeatHold.deleteMany({
        showtime: req.params.showtimeId,
        user: req.appUser._id,
      });

      return res.json({ ok: true });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Could not release holds",
      });
    }
  }
);

// POST /api/bookings/paymob/checkout
router.post(
  "/bookings/paymob/checkout",
  authenticate,
  attachAppUser,
  async (req, res) => {
    let payment;

    try {
      const { showtimeId, seats, billingData } = req.body;

      if (
        !mongoose.isValidObjectId(showtimeId) ||
        !Array.isArray(seats) ||
        seats.length === 0
      ) {
        return res.status(400).json({
          message: "Invalid booking data",
        });
      }

      const uniqueSeats = [
        ...new Set(
          seats.map((seat) =>
            String(seat).trim().toUpperCase()
          )
        ),
      ];

      if (
        uniqueSeats.length !== seats.length ||
        uniqueSeats.some(
          (seat) => !/^[A-J][1-9]$/.test(seat)
        )
      ) {
        return res.status(400).json({
          message: "Invalid or duplicate seats",
        });
      }

      const requiredFields = [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "street",
        "building",
        "floor",
        "apartment",
        "city",
        "state",
        "country",
      ];

      if (
        !billingData ||
        requiredFields.some(
          (field) =>
            typeof billingData[field] !== "string" ||
            !billingData[field].trim()
        )
      ) {
        return res.status(400).json({
          message: "Complete billing information",
        });
      }

      const showtime = await Showtime.findById(showtimeId);

      if (!showtime) {
        return res.status(404).json({
          message: "Showtime not found",
        });
      }

      const price = Number(showtime.price);

      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
          message: "Showtime price is missing or invalid",
        });
      }

      const now = new Date();

      const holds = await SeatHold.find({
        showtime: showtimeId,
        seat: { $in: uniqueSeats },
        user: req.appUser._id,
        expiresAt: { $gt: now },
      });

      if (
        holds.length !== uniqueSeats.length ||
        uniqueSeats.some(
          (seat) =>
            !holds.some((hold) => hold.seat === seat)
        )
      ) {
        return res.status(410).json({
          message: "Seat hold expired. Select seats again.",
        });
      }

      const bookedSeats = parseSeats(
        showtime.bookedSeats
      );

      if (
        uniqueSeats.some((seat) =>
          bookedSeats.includes(seat)
        )
      ) {
        return res.status(409).json({
          message: "Some seats are already booked",
        });
      }

      if (
        !process.env.PAYMOB_SECRET_KEY ||
        !process.env.PAYMOB_PUBLIC_KEY ||
        !process.env.PAYMOB_INTEGRATION_ID_CARD ||
        !process.env.PAYMOB_HMAC_SECRET ||
        !process.env.BACKEND_PUBLIC_URL ||
        !process.env.FRONTEND_URL
      ) {
        return res.status(500).json({
          message: "Paymob environment variables are missing",
        });
      }

      const amountCents =
        Math.round(price * 100) * uniqueSeats.length;

      const specialReference =
        new mongoose.Types.ObjectId().toString();

      payment = await Payment.create({
        user: req.appUser._id,
        showtime: showtimeId,
        seats: uniqueSeats,
        amountCents,
        currency: "EGP",
        status: "pending",
        specialReference,
      });

      const response = await axios.post(
        `${PAYMOB_BASE_URL}/v1/intention/`,
        {
          amount: amountCents,
          currency: "EGP",
          payment_methods: [
            Number(
              process.env.PAYMOB_INTEGRATION_ID_CARD
            ),
          ],
          items: [
            {
              name: "QuickShow movie tickets",
              amount: Math.round(price * 100),
              description: `Seats: ${uniqueSeats.join(", ")}`,
              quantity: uniqueSeats.length,
            },
          ],
          billing_data: Object.fromEntries(
            requiredFields.map((field) => [
              field,
              billingData[field].trim(),
            ])
          ),
          special_reference: specialReference,
          expiration: HOLD_MINUTES * 60,
          notification_url:
            `${process.env.BACKEND_PUBLIC_URL.replace(/\/+$/, "")}` +
            "/api/payments/paymob/webhook",
          redirection_url:
            `${process.env.FRONTEND_URL.replace(/\/+$/, "")}` +
            "/payment-result",
        },
        {
          headers: {
            Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      if (!response.data.client_secret) {
        throw new Error("Paymob did not return client_secret");
      }

     
await Payment.updateOne(
  { _id: payment._id, status: "pending" },
  {
    $set: {
      paymobIntentionId: String(response.data.id),
      ...(response.data.intention_order_id != null && {
        paymobOrderId: String(response.data.intention_order_id),
      }),
    },
  }
);


      return res.status(201).json({
        paymentId: payment._id,
        clientSecret: response.data.client_secret,
        publicKey: process.env.PAYMOB_PUBLIC_KEY,
      });
    } catch (error) {
      console.error(
        "Paymob checkout error:",
        error.response?.data || error.message
      );

      // لا نغيّر الحالة إلى failed تلقائيًا إذا كان الطلب
      // قد وصل إلى Paymob ولكن انقطع الاتصال قبل وصول الرد.
      if (
        payment &&
        error.response &&
        error.response.status >= 400
      ) {
        await Payment.updateOne(
          { _id: payment._id, status: "pending" },
          { $set: { status: "failed" } }
        );
      }

      return res.status(502).json({
        message: "Could not start Paymob checkout",
      });
    }
  }
);

function verifyPaymobHmac(obj, receivedHmac) {
  const secret = process.env.PAYMOB_HMAC_SECRET;

  if (
    !secret ||
    !obj ||
    typeof receivedHmac !== "string" ||
    !/^[a-f0-9]{128}$/i.test(receivedHmac)
  ) {
    return false;
  }

  const values = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ];

  if (values.some((value) => value == null)) {
    return false;
  }

  const message = values.map(String).join("");

  const expected = crypto
    .createHmac("sha512", secret)
    .update(message)
    .digest();

  const received = Buffer.from(receivedHmac, "hex");

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

// POST /api/payments/paymob/webhook
router.post(
  "/payments/paymob/webhook",
  async (req, res) => {
    const obj = req.body?.obj;
    const hmac = req.body?.hmac;

    if (!verifyPaymobHmac(obj, hmac)) {
      return res.status(401).json({
        message: "Invalid Paymob HMAC",
      });
    }

    let payment;

    try {
      const specialReference =
        obj.order?.merchant_order_id;

      const paymobOrderId =
        obj.order?.id != null
          ? String(obj.order.id)
          : null;

      const conditions = [];

      if (specialReference) {
        conditions.push({ specialReference });
      }

      if (paymobOrderId) {
        conditions.push({ paymobOrderId });
      }

      if (!conditions.length) {
        return res.status(400).json({
          message: "Payment reference is missing",
        });
      }

      payment = await Payment.findOne({
        $or: conditions,
      });

      if (!payment) {
        console.error(
          "Paymob payment not found:",
          specialReference,
          paymobOrderId
        );

        return res.status(404).json({
          message: "Payment not found",
        });
      }

      // Ignore duplicate callbacks for completed payments.
      if (payment.status === "paid") {
        return res.status(200).json({
          received: true,
        });
      }

      const expectedIntegrationId = Number(
        process.env.PAYMOB_INTEGRATION_ID_CARD
      );

      const validAmount =
        Number(obj.amount_cents) === payment.amountCents;

      const validCurrency =
        obj.currency === payment.currency;

      const validIntegration =
        Number(obj.integration_id) ===
        expectedIntegrationId;

      const successful =
        obj.success === true &&
        obj.pending === false &&
        obj.error_occured === false &&
        obj.is_voided !== true;

      if (
        !validAmount ||
        !validCurrency ||
        !validIntegration
      ) {
        console.error(
          "Paymob payment details do not match",
          payment._id
        );

        return res.status(400).json({
          message: "Payment details do not match",
        });
      }

      if (!successful) {
        await Payment.updateOne(
          {
            _id: payment._id,
            status: "pending",
          },
          {
            $set: {
              status: "failed",
              paymobTransactionId: String(obj.id),
            },
          }
        );

        return res.status(200).json({
          received: true,
        });
      }

      // Claim the payment once. A concurrent callback may
      // already have changed pending to processing.
      if (payment.status === "pending") {
        await Payment.updateOne(
          {
            _id: payment._id,
            status: "pending",
          },
          {
            $set: {
              status: "processing",
              paymobTransactionId: String(obj.id),
            },
          }
        );
      }

      payment = await Payment.findById(payment._id);

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      if (payment.status === "paid") {
        return res.status(200).json({
          received: true,
        });
      }

      if (payment.status !== "processing") {
        return res.status(200).json({
          received: true,
        });
      }

      // Requires MongoDB transactions support, such as
      // MongoDB Atlas or a local replica set.
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const currentPayment =
            await Payment.findById(payment._id)
              .session(session);

          if (!currentPayment) {
            throw new Error("PAYMENT_NOT_FOUND");
          }

          if (currentPayment.status === "paid") {
            return;
          }

          if (currentPayment.status !== "processing") {
            throw new Error("PAYMENT_NOT_PROCESSING");
          }

          const showtime = await Showtime.findOneAndUpdate(
            {
              _id: currentPayment.showtime,
              bookedSeats: {
                $nin: currentPayment.seats,
              },
            },
            {
              $addToSet: {
                bookedSeats: {
                  $each: currentPayment.seats,
                },
              },
            },
            {
              new: true,
              session,
            }
          );

          if (!showtime) {
            throw new Error("SEATS_UNAVAILABLE");
          }

          const booking = new Booking({
            showtime: currentPayment.showtime,
            user: currentPayment.user,
            seats: currentPayment.seats,
            totalPrice: currentPayment.amountCents / 100,
            payment: currentPayment._id,
            status: "confirmed",
          });

          await booking.save({ session });

          await SeatHold.deleteMany(
            {
              showtime: currentPayment.showtime,
              seat: { $in: currentPayment.seats },
              user: currentPayment.user,
            },
            { session }
          );

          currentPayment.status = "paid";
          currentPayment.booking = booking._id;
          currentPayment.paymobTransactionId =
            String(obj.id);

          await currentPayment.save({ session });
        });

        return res.status(200).json({
          received: true,
        });
      } catch (error) {
        if (error.message === "SEATS_UNAVAILABLE") {
          // Payment succeeded, but seats could not be booked.
          // This requires manual review/refund handling.
          await Payment.updateOne(
            {
              _id: payment._id,
              status: "processing",
            },
            {
              $set: {
                status: "failed",
                paymobTransactionId: String(obj.id),
              },
            }
          );

          console.error(
            "PAYMENT SUCCEEDED BUT SEATS ARE UNAVAILABLE. " +
              "Review/refund required:",
            payment._id
          );

          // Acknowledge the callback to avoid endless retries.
          return res.status(200).json({
            received: true,
            requiresReview: true,
          });
        }

        // Keep processing state for unexpected database errors.
        // A later callback can retry the booking transaction.
        throw error;
      } finally {
        await session.endSession();
      }
    } catch (error) {
      console.error("Paymob webhook error:", error);

      return res.status(500).json({
        message: "Could not process payment callback",
      });
    }
  }
);


module.exports = router;
