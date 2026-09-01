const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    warrantyStart: {
      type: Date,
      required: true,
    },

    warrantyEnd: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);