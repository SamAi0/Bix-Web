const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// Input validation middleware
const validateProductInput = (req, res, next) => {
  const { name, price, quantity, category, status, offer } = req.body;

  // Validate data types
  if (typeof name !== 'string' || typeof category !== 'string' || typeof status !== 'string') {
    return res.status(400).json({
      message: "Product name, category, and status must be strings",
    });
  }

  if (!name?.trim()) {
    return res.status(400).json({
      message: "Product name is required",
    });
  }

  // Sanitize name to prevent XSS
  const sanitizedName = name.trim();
  if (sanitizedName.length > 100) {
    return res.status(400).json({
      message: "Product name must be less than 100 characters",
    });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({
      message: "Price must be a positive number",
    });
  }

  if (typeof quantity !== "number" || quantity < 0) {
    return res.status(400).json({
      message: "Quantity must be a non-negative number",
    });
  }

  const validCategories = [
    "Frames",
    "Wall Hanging",
    "Bag",
    "Pen Stand",
    "Jewellery",
    "Diyas",
    "Bottle Art",
  ];

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      message: "Invalid product category",
      validCategories,
    });
  }

  if (!["Available", "Not Available"].includes(status)) {
    return res.status(400).json({
      message: "Invalid product status",
    });
  }

  if (offer !== undefined && (typeof offer !== "number" || offer < 0 || offer > 100)) {
    return res.status(400).json({
      message: "Offer must be a number between 0 and 100",
    });
  }

  next();
};

// Create Product
router.post("/", validateProductInput, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      name: req.body.name.trim(),
      offer: req.body.offer || 0,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
});

// Get All Products with filtering and sorting
router.get("/", async (req, res) => {
  try {
    const {
      category,
      status,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = "name",
      sortOrder = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      query.quantity = { $gt: 0 };
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit),
      // .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    // Get category statistics
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          averagePrice: { $avg: "$price" },
          inStock: {
            $sum: { $cond: [{ $gt: ["$quantity", 0] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// Get Product Statistics
router.get("/statistics", async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          averagePrice: { $avg: "$price" },
          outOfStock: {
            $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
          },
        },
      },
    ]);

    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ]);

    res.json({
      overview: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        averagePrice: 0,
        outOfStock: 0,
      },
      categoryDistribution,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product statistics",
      error: error.message,
    });
  }
});

// Get Product By ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// Update Product
router.put("/:id", validateProductInput, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        name: req.body.name.trim(),
        offer: req.body.offer || 0,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error updating product",
      error: error.message,
    });
  }
});

// Delete Product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product has any pending orders
    // This would require access to the Order model and checking for pending orders
    // Add this functionality if needed

    await Product.findByIdAndDelete(product._id);

    res.json({
      message: "Product deleted successfully",
      deletedProduct: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
});

// Update Product Stock
router.patch("/:id/stock", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity value" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.quantity = quantity;
    product.status = quantity > 0 ? "Available" : "Not Available";

    await product.save();

    res.json({
      message: "Product stock updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product stock",
      error: error.message,
    });
  }
});

// Get Recently Purchased Products
router.get("/recently-purchased", async (req, res) => {
  try {
    // Find recent orders that are delivered or out for delivery
    const recentOrders = await Order.find({
      status: { $in: ["Delivered", "Out for Delivery", "Shipped"] }
    })
    .sort({ orderDate: -1 })
    .limit(50) // Get last 50 orders
    .select("items orderDate");
    
    // Flatten all items from all orders
    const allItems = [];
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        allItems.push({
          ...item,
          orderDate: order.orderDate
        });
      });
    });
    
    // Group items by product ID and get most recent orders
    const uniqueItems = [];
    const seenIds = new Set();
    
    allItems.forEach(item => {
      if (!seenIds.has(item._id)) {
        seenIds.add(item._id);
        uniqueItems.push(item);
      }
    });
    
    // Limit to top 10 most recently purchased items
    const recentPurchases = uniqueItems.slice(0, 10);
    
    // Get full product details
    const productIds = recentPurchases.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Add purchase date information to each product
    const productsWithDates = products.map(product => {
      const recentItem = recentPurchases.find(item => item._id.toString() === product._id.toString());
      return {
        ...product.toObject(),
        lastPurchased: recentItem ? recentItem.orderDate : null
      };
    });
    
    res.json(productsWithDates);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recently purchased products",
      error: error.message,
    });
  }
});

// Get Related Products (Customers who bought this also bought...)
router.get("/:id/related", async (req, res) => {
  try {
    const productId = req.params.id;
    
    // First, get the current product to confirm it exists
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Find orders that contain this product
    const ordersWithProduct = await Order.find({
      "items._id": productId,
      status: { $in: ["Delivered", "Out for Delivery", "Shipped"] }
    }).limit(50);
    
    // Extract all other product IDs from these orders
    const otherProductIds = new Set();
    ordersWithProduct.forEach(order => {
      order.items.forEach(item => {
        if (item._id.toString() !== productId) {
          otherProductIds.add(item._id);
        }
      });
    });
    
    // Convert Set back to Array and limit to 10 related products
    const relatedProductIds = Array.from(otherProductIds).slice(0, 10);
    
    // Get the related products
    const relatedProducts = await Product.find({
      _id: { $in: relatedProductIds },
      status: "Available" // Only show available products
    });
    
    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching related products",
      error: error.message,
    });
  }
});

module.exports = router;
