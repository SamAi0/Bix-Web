const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    items: [
      {
        _id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        offer: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        default: "India",
      },
    },
    paymentMethod: {
      type: String,
      enum: ["Online", "COD"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: String, // Could be admin username or 'system'
        },
        notes: {
          type: String, // Any additional notes about the status change
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ username: 1, orderDate: -1 });

module.exports = mongoose.model("Order", orderSchema);
