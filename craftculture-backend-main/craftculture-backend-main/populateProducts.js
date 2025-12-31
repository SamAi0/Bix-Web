const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const REMOTE_DB_URL = process.env.REMOTE_DB_URL;

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
        { name: "Frame3", quantity: 20, price: 100.00, image: "Frames/frame3.jpeg", status: "Not Available", category: "Frames", offer: 8 },
        { name: "Frame4", quantity: 18, price: 140.00, image: "Frames/frame4.jpeg", status: "Available", category: "Frames", offer: 12 },
        { name: "Frame5", quantity: 8, price: 200.00, image: "Frames/frame5.jpeg", status: "Available", category: "Frames", offer: 20 },
        { name: "Frame6", quantity: 25, price: 90.00, image: "Frames/frame6.jpeg", status: "Available", category: "Frames", offer: 5 },
        { name: "Frame7", quantity: 12, price: 175.00, image: "Frames/frame7.jpeg", status: "Available", category: "Frames", offer: 18 },
        { name: "Frame8", quantity: 14, price: 130.00, image: "Frames/frame8.jpeg", status: "Not Available", category: "Frames", offer: 10 },
        { name: "Frame9", quantity: 22, price: 110.00, image: "Frames/frame9.jpeg", status: "Available", category: "Frames", offer: 7 },
        { name: "Frame10", quantity: 16, price: 160.00, image: "Frames/frame10.jpeg", status: "Available", category: "Frames", offer: 12 }
      );
      break;
      
    case "Wall Hanging":
      products.push(
        { name: "WallHanging1", quantity: 20, price: 45.00, image: "WallHanging/wallhanging1.jpeg", status: "Available", category: "Wall Hanging", offer: 10 },
        { name: "WallHanging2", quantity: 30, price: 60.00, image: "WallHanging/wallhanging2.jpeg", status: "Not Available", category: "Wall Hanging", offer: 15 },
        { name: "WallHanging3", quantity: 25, price: 80.00, image: "WallHanging/wallhanging3.jpeg", status: "Available", category: "Wall Hanging", offer: 5 },
        { name: "WallHanging4", quantity: 15, price: 100.00, image: "WallHanging/wallhanging4.jpeg", status: "Available", category: "Wall Hanging", offer: 20 },
        { name: "WallHanging5", quantity: 35, price: 55.00, image: "WallHanging/wallhanging5.jpeg", status: "Not Available", category: "Wall Hanging", offer: 8 },
        { name: "WallHanging6", quantity: 40, price: 90.00, image: "WallHanging/wallhanging6.jpeg", status: "Available", category: "Wall Hanging", offer: 12 },
        { name: "WallHanging7", quantity: 50, price: 70.00, image: "WallHanging/wallhanging7.jpeg", status: "Available", category: "Wall Hanging", offer: 10 },
        { name: "WallHanging8", quantity: 60, price: 50.00, image: "WallHanging/wallhanging8.jpeg", status: "Not Available", category: "Wall Hanging", offer: 18 },
        { name: "WallHanging9", quantity: 10, price: 120.00, image: "WallHanging/wallhanging9.jpeg", status: "Available", category: "Wall Hanging", offer: 15 },
        { name: "WallHanging10", quantity: 30, price: 75.00, image: "WallHanging/wallhanging10.jpeg", status: "Not Available", category: "Wall Hanging", offer: 10 },
        { name: "WallHanging11", quantity: 20, price: 85.00, image: "WallHanging/wallhanging11.jpeg", status: "Available", category: "Wall Hanging", offer: 7 },
        { name: "WallHanging12", quantity: 40, price: 95.00, image: "WallHanging/wallhanging12.jpeg", status: "Available", category: "Wall Hanging", offer: 15 },
        { name: "WallHanging13", quantity: 45, price: 60.00, image: "WallHanging/wallhanging13.jpeg", status: "Available", category: "Wall Hanging", offer: 10 }
      );
      break;
      
    case "Bag":
      products.push(
        { name: "Bag1", quantity: 30, price: 50.00, image: "Bag/bag1.jpeg", status: "Available", category: "Bag", offer: 10 },
        { name: "Bag2", quantity: 25, price: 45.00, image: "Bag/bag2.jpeg", status: "Available", category: "Bag", offer: 5 },
        { name: "Bag3", quantity: 40, price: 55.00, image: "Bag/bag3.jpeg", status: "Not Available", category: "Bag", offer: 0 },
        { name: "Bag4", quantity: 20, price: 60.00, image: "Bag/bag4.jpeg", status: "Available", category: "Bag", offer: 15 },
        { name: "Bag5", quantity: 50, price: 35.00, image: "Bag/bag5.jpeg", status: "Available", category: "Bag", offer: 8 },
        { name: "Bag6", quantity: 35, price: 65.00, image: "Bag/bag6.jpeg", status: "Not Available", category: "Bag", offer: 12 },
        { name: "Bag7", quantity: 60, price: 40.00, image: "Bag/bag7.jpeg", status: "Available", category: "Bag", offer: 18 },
        { name: "Bag8", quantity: 15, price: 80.00, image: "Bag/bag8.jpeg", status: "Available", category: "Bag", offer: 20 },
        { name: "Bag9", quantity: 10, price: 90.00, image: "Bag/bag9.jpeg", status: "Not Available", category: "Bag", offer: 25 },
        { name: "Bag10", quantity: 45, price: 75.00, image: "Bag/bag10.jpeg", status: "Available", category: "Bag", offer: 10 },
        { name: "Bag11", quantity: 30, price: 85.00, image: "Bag/bag11.jpeg", status: "Available", category: "Bag", offer: 5 },
        { name: "Bag12", quantity: 50, price: 100.00, image: "Bag/bag12.jpeg", status: "Available", category: "Bag", offer: 15 },
        { name: "Bag13", quantity: 70, price: 60.00, image: "Bag/bag13.jpeg", status: "Available", category: "Bag", offer: 7 },
        { name: "Bag14", quantity: 12, price: 120.00, image: "Bag/bag14.jpeg", status: "Not Available", category: "Bag", offer: 18 },
        { name: "Bag15", quantity: 25, price: 110.00, image: "Bag/bag15.jpeg", status: "Available", category: "Bag", offer: 10 },
        { name: "Bag16", quantity: 40, price: 130.00, image: "Bag/bag16.jpeg", status: "Available", category: "Bag", offer: 5 }
      );
      break;
      
    case "Pen Stand":
      products.push(
        { name: "PenStand1", quantity: 25, price: 15.00, image: "PenStand/penstand1.jpeg", status: "Available", category: "Pen Stand", offer: 5 },
        { name: "PenStand2", quantity: 30, price: 18.00, image: "PenStand/penstand2.jpeg", status: "Not Available", category: "Pen Stand", offer: 10 },
        { name: "PenStand3", quantity: 20, price: 20.00, image: "PenStand/penstand3.jpeg", status: "Available", category: "Pen Stand", offer: 8 },
        { name: "PenStand4", quantity: 15, price: 25.00, image: "PenStand/penstand4.jpeg", status: "Available", category: "Pen Stand", offer: 12 },
        { name: "PenStand5", quantity: 40, price: 12.00, image: "PenStand/penstand5.jpeg", status: "Available", category: "Pen Stand", offer: 6 },
        { name: "PenStand6", quantity: 35, price: 22.00, image: "PenStand/penstand6.jpeg", status: "Not Available", category: "Pen Stand", offer: 15 },
        { name: "PenStand7", quantity: 45, price: 17.00, image: "PenStand/penstand7.jpeg", status: "Available", category: "Pen Stand", offer: 7 },
        { name: "PenStand8", quantity: 10, price: 30.00, image: "PenStand/penstand8.jpeg", status: "Available", category: "Pen Stand", offer: 5 }
      );
      break;
      
    case "Jewellery":
      products.push(
        { name: "Jewellery1", quantity: 25, price: 30.00, image: "Jewellery/jewellery1.jpeg", status: "Available", category: "Jewellery", offer: 10 },
        { name: "Jewellery2", quantity: 35, price: 50.00, image: "Jewellery/jewellery2.jpeg", status: "Available", category: "Jewellery", offer: 5 },
        { name: "Jewellery3", quantity: 20, price: 75.00, image: "Jewellery/jewellery3.jpeg", status: "Not Available", category: "Jewellery", offer: 0 },
        { name: "Jewellery4", quantity: 30, price: 120.00, image: "Jewellery/jewellery4.jpeg", status: "Available", category: "Jewellery", offer: 15 },
        { name: "Jewellery5", quantity: 18, price: 85.00, image: "Jewellery/jewellery5.jpeg", status: "Available", category: "Jewellery", offer: 10 },
        { name: "Jewellery6", quantity: 40, price: 60.00, image: "Jewellery/jewellery6.jpeg", status: "Not Available", category: "Jewellery", offer: 20 },
        { name: "Jewellery7", quantity: 55, price: 100.00, image: "Jewellery/jewellery7.jpeg", status: "Available", category: "Jewellery", offer: 5 },
        { name: "Jewellery8", quantity: 40, price: 65.00, image: "Jewellery/jewellery8.jpeg", status: "Available", category: "Jewellery", offer: 8 },
        { name: "Jewellery9", quantity: 22, price: 95.00, image: "Jewellery/jewellery9.jpeg", status: "Not Available", category: "Jewellery", offer: 0 },
        { name: "Jewellery10", quantity: 50, price: 55.00, image: "Jewellery/jewellery10.jpeg", status: "Available", category: "Jewellery", offer: 12 },
        { name: "Jewellery11", quantity: 30, price: 90.00, image: "Jewellery/jewellery11.jpeg", status: "Available", category: "Jewellery", offer: 7 },
        { name: "Jewellery12", quantity: 20, price: 110.00, image: "Jewellery/jewellery12.jpeg", status: "Not Available", category: "Jewellery", offer: 25 },
        { name: "Jewellery13", quantity: 60, price: 75.00, image: "Jewellery/jewellery13.jpeg", status: "Available", category: "Jewellery", offer: 10 },
        { name: "Jewellery14", quantity: 35, price: 45.00, image: "Jewellery/jewellery14.jpeg", status: "Available", category: "Jewellery", offer: 18 },
        { name: "Jewellery15", quantity: 45, price: 130.00, image: "Jewellery/jewellery15.jpeg", status: "Not Available", category: "Jewellery", offer: 20 },
        { name: "Jewellery16", quantity: 25, price: 100.00, image: "Jewellery/jewellery16.jpeg", status: "Available", category: "Jewellery", offer: 5 },
        { name: "Jewellery17", quantity: 10, price: 140.00, image: "Jewellery/jewellery17.jpeg", status: "Available", category: "Jewellery", offer: 10 },
        { name: "Jewellery18", quantity: 30, price: 50.00, image: "Jewellery/jewellery18.jpeg", status: "Available", category: "Jewellery", offer: 15 }
      );
      break;
      
    case "Diyas":
      products.push(
        { name: "Diya1", quantity: 20, price: 15.00, image: "Diyas/diya1.jpeg", status: "Available", category: "Diyas", offer: 10 },
        { name: "Diya2", quantity: 15, price: 20.00, image: "Diyas/diya2.jpeg", status: "Available", category: "Diyas", offer: 5 },
        { name: "Diya3", quantity: 30, price: 18.50, image: "Diyas/diya3.jpeg", status: "Not Available", category: "Diyas", offer: 0 },
        { name: "Diya4", quantity: 50, price: 12.00, image: "Diyas/diya4.jpeg", status: "Available", category: "Diyas", offer: 15 },
        { name: "Diya5", quantity: 10, price: 25.00, image: "Diyas/diya5.jpeg", status: "Available", category: "Diyas", offer: 8 },
        { name: "Diya6", quantity: 12, price: 30.00, image: "Diyas/diya6.jpeg", status: "Not Available", category: "Diyas", offer: 12 },
        { name: "Diya7", quantity: 25, price: 19.99, image: "Diyas/diya7.jpeg", status: "Available", category: "Diyas", offer: 18 },
        { name: "Diya8", quantity: 5, price: 22.00, image: "Diyas/diya8.jpeg", status: "Not Available", category: "Diyas", offer: 20 },
        { name: "Diya9", quantity: 35, price: 17.00, image: "Diyas/diya9.jpeg", status: "Available", category: "Diyas", offer: 7 },
        { name: "Diya10", quantity: 40, price: 13.50, image: "Diyas/diya10.jpeg", status: "Available", category: "Diyas", offer: 5 }
      );
      break;
      
    case "Bottle Art":
      products.push(
        { name: "BottleArt1", quantity: 20, price: 35.00, image: "BottleArt/bottleart1.jpeg", status: "Available", category: "Bottle Art", offer: 10 },
        { name: "BottleArt2", quantity: 15, price: 40.00, image: "BottleArt/bottleart2.jpeg", status: "Available", category: "Bottle Art", offer: 12 },
        { name: "BottleArt3", quantity: 10, price: 50.00, image: "BottleArt/bottleart3.jpeg", status: "Not Available", category: "Bottle Art", offer: 8 },
        { name: "BottleArt4", quantity: 25, price: 30.00, image: "BottleArt/bottleart4.jpeg", status: "Available", category: "Bottle Art", offer: 5 },
        { name: "BottleArt5", quantity: 12, price: 60.00, image: "BottleArt/bottleart5.jpeg", status: "Available", category: "Bottle Art", offer: 15 },
        { name: "BottleArt6", quantity: 18, price: 45.00, image: "BottleArt/bottleart6.jpeg", status: "Not Available", category: "Bottle Art", offer: 10 },
        { name: "BottleArt7", quantity: 22, price: 38.00, image: "BottleArt/bottleart7.jpeg", status: "Available", category: "Bottle Art", offer: 7 },
        { name: "BottleArt8", quantity: 8, price: 70.00, image: "BottleArt/bottleart8.jpeg", status: "Available", category: "Bottle Art", offer: 20 },
        { name: "BottleArt9", quantity: 30, price: 25.00, image: "BottleArt/bottleart9.jpeg", status: "Available", category: "Bottle Art", offer: 5 },
        { name: "BottleArt10", quantity: 16, price: 55.00, image: "BottleArt/bottleart10.jpeg", status: "Available", category: "Bottle Art", offer: 18 },
        { name: "BottleArt11", quantity: 20, price: 40.00, image: "BottleArt/bottleart11.jpeg", status: "Available", category: "Bottle Art", offer: 12 },
        { name: "BottleArt12", quantity: 28, price: 32.00, image: "BottleArt/bottleart12.jpeg", status: "Available", category: "Bottle Art", offer: 6 },
        { name: "BottleArt13", quantity: 14, price: 48.00, image: "BottleArt/bottleart13.jpeg", status: "Not Available", category: "Bottle Art", offer: 10 },
        { name: "BottleArt14", quantity: 18, price: 42.00, image: "BottleArt/bottleart14.jpeg", status: "Available", category: "Bottle Art", offer: 7 },
        { name: "BottleArt15", quantity: 10, price: 65.00, image: "BottleArt/bottleart15.jpeg", status: "Available", category: "Bottle Art", offer: 15 }
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
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
    mongoose.connection.close();
  } catch (error) {
    console.error("Error populating database:", error);
    process.exit(1);
  }
};

populateDatabase();