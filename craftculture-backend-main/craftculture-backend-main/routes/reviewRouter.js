const express = require("express");
const jwt = require("jsonwebtoken");
const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");
const { JWT_SECRET } = require("../constants");
const router = express.Router();

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No valid token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists in database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

// GET all reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .populate("userId", "username");
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new review
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    
    const review = new Review({
      productId,
      userId: req.user.id,
      username: req.user.username,
      rating,
      comment
    });
    
    const savedReview = await review.save();
    
    // Update product's average rating
    await updateProductRating(productId);
    
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a review
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Check if user owns this review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    review.rating = rating;
    review.comment = comment;
    
    const updatedReview = await review.save();
    
    // Update product's average rating
    await updateProductRating(review.productId);
    
    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a review
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    // Check if user owns this review or is admin
    if (review.userId.toString() !== req.user.id && req.user.userRole !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    await review.remove();
    
    // Update product's average rating
    await updateProductRating(review.productId);
    
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to update product's average rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ productId });
    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, { 
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length
      });
    } else {
      await Product.findByIdAndUpdate(productId, { 
        rating: 0,
        reviewCount: 0
      });
    }
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
};

module.exports = router;