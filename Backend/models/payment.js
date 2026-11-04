
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymobOrderId: {
  type: String,
},
paymobOrderId: {
  type: String,
},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: {
      type: [String],
      required: true,
    },
    amountCents: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "EGP",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "failed",
        "expired",
      ],
      default: "pending",
    },
    specialReference: {
      type: String,
      required: true,
      unique: true,
    },
    paymobIntentionId: String,
    paymobTransactionId: String,
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
