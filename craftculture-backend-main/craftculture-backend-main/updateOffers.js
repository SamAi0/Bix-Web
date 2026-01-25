const mongoose = require("mongoose");
require("dotenv").config();

// Import the Product model
const Product = require("./models/Product");

// Import the shared database connection
const db = require('./db');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/craftculture", {
  // Modern connection options
});

// Function to update offers for all products
async function updateAllOffers(offerPercentage) {
  try {
    const result = await Product.updateMany(
      {}, // Update all products
      { $set: { offer: offerPercentage } } // Set offer to specified percentage
    );
    
    console.log(`Successfully updated ${result.modifiedCount} products with ${offerPercentage}% offer (Total matched: ${result.matchedCount})`);
  } catch (error) {
    console.error("Error updating offers:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to update offers by category
async function updateOffersByCategory(category, offerPercentage) {
  try {
    const result = await Product.updateMany(
      { category: category }, // Filter by category
      { $set: { offer: offerPercentage } } // Set offer to specified percentage
    );
    
    console.log(`Successfully updated ${result.modifiedCount} ${category} products with ${offerPercentage}% offer (Total matched: ${result.matchedCount})`);
  } catch (error) {
    console.error("Error updating offers by category:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to update specific product by ID
async function updateSpecificProduct(productId, offerPercentage) {
  try {
    const result = await Product.findByIdAndUpdate(
      productId,
      { $set: { offer: offerPercentage } },
      { new: true } // Return updated document
    );
    
    if (result) {
      console.log(`Successfully updated product "${result.name}" with ${offerPercentage}% offer`);
    } else {
      console.log("Product not found");
    }
  } catch (error) {
    console.error("Error updating specific product:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Function to update offers based on conditions
async function updateOffersWithConditions() {
  try {
    // Example: Set 10% offer for all products in 'Jewellery' category
    await updateOffersByCategory("Jewellery", 10);
    
    // Example: Set 15% offer for all products in 'Frames' category
    await updateOffersByCategory("Frames", 15);
    
    // Example: Set 20% offer for all products in 'Wall Hanging' category
    await updateOffersByCategory("Wall Hanging", 20);
    
    // Example: Set 5% offer for all products in 'Bag' category
    await updateOffersByCategory("Bag", 5);
    
    console.log("All category-specific offers updated successfully!");
  } catch (error) {
    console.error("Error in conditional updates:", error);
  } finally {
    await mongoose.connection.close();
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Usage:");
    console.log("  node updateOffers.js all <percentage>           - Update all products with specific offer");
    console.log("  node updateOffers.js category <category> <percentage> - Update products in specific category");
    console.log("  node updateOffers.js specific <productId> <percentage> - Update specific product");
    console.log("  node updateOffers.js demo                       - Run demo updates");
    console.log("\nExamples:");
    console.log("  node updateOffers.js all 10                     - Set 10% offer for all products");
    console.log("  node updateOffers.js category 'Jewellery' 15    - Set 15% offer for all Jewellery products");
    return;
  }
  
  const command = args[0];
  
  switch(command) {
    case 'all':
      if (args.length !== 2) {
        console.log("Usage: node updateOffers.js all <percentage>");
        break;
      }
      const allPercentage = parseInt(args[1]);
      if (isNaN(allPercentage) || allPercentage < 0 || allPercentage > 100) {
        console.log("Please provide a valid percentage (0-100)");
        break;
      }
      await updateAllOffers(allPercentage);
      break;
      
    case 'category':
      if (args.length !== 3) {
        console.log("Usage: node updateOffers.js category <category> <percentage>");
        break;
      }
      const category = args[1];
      const catPercentage = parseInt(args[2]);
      if (isNaN(catPercentage) || catPercentage < 0 || catPercentage > 100) {
        console.log("Please provide a valid percentage (0-100)");
        break;
      }
      await updateOffersByCategory(category, catPercentage);
      break;
      
    case 'specific':
      if (args.length !== 3) {
        console.log("Usage: node updateOffers.js specific <productId> <percentage>");
        break;
      }
      const productId = args[1];
      const specPercentage = parseInt(args[2]);
      if (isNaN(specPercentage) || specPercentage < 0 || specPercentage > 100) {
        console.log("Please provide a valid percentage (0-100)");
        break;
      }
      await updateSpecificProduct(productId, specPercentage);
      break;
      
    case 'demo':
      console.log("Running demo updates...");
      await updateOffersWithConditions();
      break;
      
    default:
      console.log("Unknown command. Use 'all', 'category', 'specific', or 'demo'");
  }
}

// Run the main function
main();