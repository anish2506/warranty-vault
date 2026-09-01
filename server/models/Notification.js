const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["WARRANTY_EXPIRING", "WARRANTY_EXPIRED"],
      required: true,
    },
    reminderDays: {
      type: Number,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate notifications for the same product, type, and threshold
notificationSchema.index(
  { product: 1, type: 1, reminderDays: 1 },
  { unique: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
