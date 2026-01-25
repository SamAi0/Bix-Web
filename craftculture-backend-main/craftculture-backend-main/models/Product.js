const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  image: { type: String },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ["Available", "Not Available", "Discontinued"],
    required: true,
    default: "Available"
  },
  category: {
    type: String,
    enum: [
      "Frames",
      "Wall Hanging",
      "Bag",
      "Pen Stand",
      "Jewellery",
      "Diyas",
      "Bottle Art",
    ],
    required: true,
  },
  subcategory: { type: String },
  description: { type: String },
  tags: [{ type: String }],
  offer: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  
  // Inventory tracking
  lowStockThreshold: { type: Number, default: 5 },
  trackInventory: { type: Boolean, default: true },
  
  // Product variants
  hasVariants: { type: Boolean, default: false },
  variants: [{
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    comparePrice: { type: Number },
    quantity: { type: Number, required: true },
    options: {
      type: Map,
      of: String
    },
    image: { type: String },
    status: {
      type: String,
      enum: ["Available", "Not Available", "Discontinued"],
      default: "Available"
    }
  }],
  
  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
