const mongoose = require("mongoose");
const Product = require("./models/Product");
const db = require('./db');
require("dotenv").config();

const REMOTE_DB_URL = process.env.REMOTE_DB_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/craftculture";

if (!REMOTE_DB_URL) {
  console.error("ERROR: REMOTE_DB_URL not found in environment variables");
  process.exit(1);
}

const sampleProducts = [];

// Add products from all categories
const categories = [
  "Frames", "Wall Hanging", "Bag", "Pen Stand", "Jewellery", "Diyas", "Bottle Art"
];

const addProductsFromCategory = (category) => {
  // Define sample products for each category
  const products = [];
  
  switch(category) {
    case "Frames":
      products.push(
        { name: "Frame1", quantity: 15, price: 120.00, image: "Frames/frame1.jpeg", status: "Available", category: "Frames", offer: 10 },
        { name: "Frame2", quantity: 10, price: 150.00, image: "Frames/frame2.jpeg", status: "Available", category: "Frames", offer: 15 },
        { name: "Frame3", quantity: 20, price: 100.00, image: "Frames/frame3.jpeg", status: "Not Available", category: "Frames", offer: 8 }
      );
      break;
      
    case "Wall Hanging":
      products.push(
        { name: "WallHanging1", quantity: 20, price: 45.00, image: "WallHanging/wallhanging1.jpeg", status: "Available", category: "Wall Hanging", offer: 10 },
        { name: "WallHanging2", quantity: 30, price: 60.00, image: "WallHanging/wallhanging2.jpeg", status: "Not Available", category: "Wall Hanging", offer: 15 },
        { name: "WallHanging3", quantity: 25, price: 80.00, image: "WallHanging/wallhanging3.jpeg", status: "Available", category: "Wall Hanging", offer: 5 }
      );
      break;
      
    case "Bag":
      products.push(
        { name: "Bag1", quantity: 30, price: 50.00, image: "Bag/bag1.jpeg", status: "Available", category: "Bag", offer: 10 },
        { name: "Bag2", quantity: 25, price: 45.00, image: "Bag/bag2.jpeg", status: "Available", category: "Bag", offer: 5 },
        { name: "Bag3", quantity: 40, price: 55.00, image: "Bag/bag3.jpeg", status: "Not Available", category: "Bag", offer: 0 }
      );
      break;
      
    case "Pen Stand":
      products.push(
        { name: "PenStand1", quantity: 25, price: 15.00, image: "PenStand/penstand1.jpeg", status: "Available", category: "Pen Stand", offer: 99 },
        { name: "PenStand2", quantity: 30, price: 18.00, image: "PenStand/penstand2.jpeg", status: "Not Available", category: "Pen Stand", offer: 10 },
        { name: "PenStand3", quantity: 20, price: 20.00, image: "PenStand/penstand3.jpeg", status: "Available", category: "Pen Stand", offer: 8 }
      );
      break;
      
    case "Jewellery":
      products.push(
        { name: "Jewellery1", quantity: 25, price: 30.00, image: "Jewellery/jewellery1.jpeg", status: "Available", category: "Jewellery", offer: 10 },
        { name: "Jewellery2", quantity: 35, price: 50.00, image: "Jewellery/jewellery2.jpeg", status: "Available", category: "Jewellery", offer: 5 },
        { name: "Jewellery3", quantity: 20, price: 75.00, image: "Jewellery/jewellery3.jpeg", status: "Not Available", category: "Jewellery", offer: 0 }
      );
      break;
      
    case "Diyas":
      products.push(
        { name: "Diya1", quantity: 20, price: 15.00, image: "Diyas/diya1.jpeg", status: "Available", category: "Diyas", offer: 10 },
        { name: "Diya2", quantity: 15, price: 20.00, image: "Diyas/diya2.jpeg", status: "Available", category: "Diyas", offer: 5 },
        { name: "Diya3", quantity: 30, price: 18.50, image: "Diyas/diya3.jpeg", status: "Not Available", category: "Diyas", offer: 0 }
      );
      break;
      
    case "Bottle Art":
      products.push(
        { name: "BottleArt1", quantity: 20, price: 35.00, image: "BottleArt/bottleart1.jpeg", status: "Available", category: "Bottle Art", offer: 10 },
        { name: "BottleArt2", quantity: 15, price: 40.00, image: "BottleArt/bottleart2.jpeg", status: "Available", category: "Bottle Art", offer: 12 },
        { name: "BottleArt3", quantity: 10, price: 50.00, image: "BottleArt/bottleart3.jpeg", status: "Not Available", category: "Bottle Art", offer: 8 }
      );
      break;
  }
  
  sampleProducts.push(...products);
};

// Add products for all categories
categories.forEach(category => addProductsFromCategory(category));

const populateDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(REMOTE_DB_URL, {
      // Modern connection options
    });

    console.log("Connected to database");

    // Clear existing products
    console.log("Clearing existing products...");
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    console.log(`Inserting ${sampleProducts.length} products...`);
    await Product.insertMany(sampleProducts);
    console.log(`Successfully inserted ${sampleProducts.length} products`);

    console.log("Database population completed successfully!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error populating database:", error);
    process.exit(1);
  }
};

populateDatabase();