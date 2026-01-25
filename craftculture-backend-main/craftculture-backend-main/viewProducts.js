const mongoose = require("mongoose");
require("dotenv").config();

// Import the Product model
const Product = require("./models/Product");

// Import the shared database connection
const db = require('./db');

// Connect to database
const DB_URL = process.env.MONGODB_URI || process.env.REMOTE_DB_URL || "mongodb://localhost:27017/craftculture";

mongoose.connect(DB_URL, {
  // Modern connection options
});

// Function to view all products with their offers
async function viewAllProducts() {
  try {
    const products = await Product.find({}, 'name category price offer status quantity');
    
    console.log("Current Products and Their Offers:");
    console.log("=".repeat(80));
    console.log("Name".padEnd(30) + "Category".padEnd(15) + "Price".padEnd(10) + "Offer%".padEnd(10) + "Status".padEnd(12) + "Qty");
    console.log("-".repeat(80));
    
    products.forEach(product => {
      console.log(
        product.name.padEnd(30).substring(0, 30) +
        product.category.padEnd(15).substring(0, 15) +
        `₹${product.price}`.padEnd(10) +
        `${product.offer}%`.padEnd(10) +
        product.status.padEnd(12) +
        product.quantity
      );
    });
    
    console.log("-".repeat(80));
    console.log(`Total products: ${products.length}`);
    
    // Show summary by category
    console.log("\nSummary by Category:");
    console.log("-".repeat(40));
    const categories = [...new Set(products.map(p => p.category))];
    categories.forEach(category => {
      const catProducts = products.filter(p => p.category === category);
      const avgOffer = catProducts.reduce((sum, p) => sum + p.offer, 0) / catProducts.length;
      console.log(`${category}: ${catProducts.length} products, Avg Offer: ${avgOffer.toFixed(1)}%`);
    });
    
  } catch (error) {
    console.error("Error viewing products:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to view products by category
async function viewProductsByCategory(category) {
  try {
    const products = await Product.find({ category: category }, 'name category price offer status quantity');
    
    console.log(`Products in ${category} Category:`);
    console.log("=".repeat(80));
    console.log("Name".padEnd(30) + "Price".padEnd(10) + "Offer%".padEnd(10) + "Status".padEnd(12) + "Qty");
    console.log("-".repeat(80));
    
    products.forEach(product => {
      console.log(
        product.name.padEnd(30).substring(0, 30) +
        `₹${product.price}`.padEnd(10) +
        `${product.offer}%`.padEnd(10) +
        product.status.padEnd(12) +
        product.quantity
      );
    });
    
  } catch (error) {
    console.error("Error viewing products by category:", error);
  }
}

// Connect to database and run the main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node viewProducts.js                    - View all products");
    console.log("  node viewProducts.js <category>         - View products in specific category");
    console.log("\nExamples:");
    console.log("  node viewProducts.js                    - View all products");
    console.log("  node viewProducts.js 'Jewellery'       - View Jewellery products");
    console.log("  node viewProducts.js 'Frames'          - View Frames products");
    return;
  }
  
  const category = args[0];
  
  if (category && category !== "all") {
    await viewProductsByCategory(category);
  } else {
    await viewAllProducts();
  }
}

// Run the main function
main();