const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Input validation middleware
const validateOrderInput = (req, res, next) => {
  const {
    username,
    fullName,
    email,
    phone,
    items,
    totalAmount,
    address,
    paymentMethod,
  } = req.body;

  // Validate string inputs
  if (
    typeof username !== 'string' ||
    typeof fullName !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string'
  ) {
    return res.status(400).json({
      message: "Customer information must be strings",
    });
  }

  if (
    !username?.trim() ||
    !fullName?.trim() ||
    !email?.trim() ||
    !phone?.trim()
  ) {
    return res.status(400).json({
      message: "Customer information is incomplete",
    });
  }

  // Validate username and fullName length
  if (username.trim().length > 100 || fullName.trim().length > 100) {
    return res.status(400).json({
      message: "Username and full name must be less than 100 characters",
    });
  }

  if (!items?.length || !Array.isArray(items)) {
    return res.status(400).json({
      message: "Order must contain at least one item",
    });
  }

  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({
      message: "Invalid total amount",
    });
  }

  if (!address || typeof address !== 'object') {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }

  if (
    typeof address.street !== 'string' ||
    typeof address.city !== 'string' ||
    typeof address.state !== 'string' ||
    typeof address.postalCode !== 'string'
  ) {
    return res.status(400).json({
      message: "Address fields must be strings",
    });
  }

  if (
    !address?.street?.trim() ||
    !address?.city?.trim() ||
    !address?.state?.trim() ||
    !address?.postalCode?.trim()
  ) {
    return res.status(400).json({
      message: "Shipping address is incomplete",
    });
  }

  if (typeof paymentMethod !== 'string' || !["Online", "COD"].includes(paymentMethod)) {
    return res.status(400).json({
      message: "Invalid payment method",
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  // Basic phone validation
  const phoneRegex = /^\+?[\d\s-()]{8,}$/;
  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({
      message: "Invalid phone number format",
    });
  }

  // Validate items array
  for (const item of items) {
    if (
      typeof item._id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      typeof item.quantity !== 'number' ||
      typeof item.offer !== 'number'
    ) {
      return res.status(400).json({
        message: "Invalid item format in order",
      });
    }

    if (item.quantity <= 0 || item.offer < 0 || item.offer > 100) {
      return res.status(400).json({
        message: "Invalid item quantity or offer",
      });
    }
  }

  next();
};

// Create new order
router.post("/", validateOrderInput, async (req, res) => {
  try {
    const {
      username,
      fullName,
      email,
      phone,
      items,
      totalAmount,
      address,
      paymentMethod,
    } = req.body;

    // Validate and update product quantities
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }

      if (product.status !== "Available") {
        throw new Error(`Product ${item.name} is currently not available`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.name}. Available: ${product.quantity}`
        );
      }

      if (product.price !== item.price || product.offer !== item.offer) {
        throw new Error(`Price or offer mismatch for ${item.name}`);
      }

      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.status = "Not Available";
      }
      await product.save();
    }

    // Validate total amount
    const calculatedTotal = items.reduce((sum, item) => {
      const price = item.price * item.quantity;
      const discount = price * (item.offer / 100);
      return sum + (price - discount);
    }, 0);

    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      throw new Error("Total amount calculation mismatch");
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const order = new Order({
      username: username.trim(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      items,
      totalAmount,
      address,
      paymentMethod,
      deliveryDate,
      status: "Pending",
      orderDate: new Date(),
    });

    await order.save();

    res.status(201).json({
      message: "Order created successfully",
      orderId: order._id,
      estimatedDelivery: deliveryDate,
    });
  } catch (error) {
    // If an error occurred, try to restore product quantities
    if (req.body.items) {
      for (const item of req.body.items) {
        try {
          const product = await Product.findById(item._id);
          if (product) {
            product.quantity += item.quantity;
            if (product.quantity > 0) {
              product.status = "Available";
            }
            await product.save();
          }
        } catch (restoreError) {
          console.error("Error restoring product quantity:", restoreError);
        }
      }
    }

    console.error("Order creation error:", error);
    res.status(400).json({
      message: error.message || "Error creating order",
    });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "-orderDate",
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select("-__v"),
      Order.countDocuments(query),
    ]);

    // Calculate order statistics
    const orderStats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const paymentStats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalOrders: total,
      orderStats,
      paymentStats,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// Get user's orders
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const orders = await Order.find({ username })
      .sort("-orderDate")
      .select("-__v");

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// Update order status
router.patch("/:orderId/status", async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    // Validate inputs
    if (typeof status !== 'string' || !["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    if (trackingNumber && typeof trackingNumber !== 'string') {
      return res.status(400).json({ message: "Tracking number must be a string" });
    }

    if (notes && typeof notes !== 'string') {
      return res.status(400).json({ message: "Notes must be a string" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res
        .status(400)
        .json({ message: "Cannot update status of cancelled order" });
    }

    // If changing to Cancelled status, restore product quantities
    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item._id);
        if (product) {
          product.quantity += item.quantity;
          product.status = "Available";
          await product.save();
        }
      }
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber.trim();
    if (notes) order.notes = notes.trim();

    if (status === "Delivered") {
      order.deliveryDate = new Date();
    }

    await order.save();

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
});

module.exports = router;
