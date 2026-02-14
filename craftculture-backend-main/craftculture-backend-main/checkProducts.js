const mongoose = require("mongoose");
require("dotenv").config();

// Import the Product model
const Product = require("./models/Product");

// Import the shared database connection
const db = require('./db');

async function checkProducts() {
  try {
    const products = await Product.find({});
    
    console.log("Current Products in Database:");
    console.log("=".repeat(100));
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Image: ${product.image}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Status: ${product.status}`);
      console.log("---");
    });
    
    console.log(`\nTotal products: ${products.length}`);
    
  } catch (error) {
    console.error("Error checking products:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkProducts();