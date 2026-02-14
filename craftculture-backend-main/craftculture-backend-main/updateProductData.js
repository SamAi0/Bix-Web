const mongoose = require("mongoose");
require("dotenv").config();

// Import the Product model
const Product = require("./models/Product");

// Import the shared database connection
const db = require('./db');

// Define proper product names for each category (limited to 3-4 products per category)
const productData = {
  "Frames": [
    { name: "Elegant Wooden Frame", image: "Frames/frame1.jpeg" },
    { name: "Modern Metal Frame", image: "Frames/frame2.jpeg" },
    { name: "Vintage Photo Frame", image: "Frames/frame3.jpeg" },
    { name: "Bohemian Style Frame", image: "Frames/frame4.jpeg" }
  ],
  "Wall Hanging": [
    { name: "Bohemian Wall Hanging", image: "WallHanging/wallhanging1.jpeg" },
    { name: "Geometric Macrame Wall Art", image: "WallHanging/wallhanging2.jpeg" },
    { name: "Floral Embroidered Wall Decor", image: "WallHanging/wallhanging3.jpeg" },
    { name: "Beaded Curtain Wall Hanging", image: "WallHanging/wallhanging4.jpeg" }
  ],
  "Bag": [
    { name: "Handwoven Jute Tote Bag", image: "Bag/bag1.jpeg" },
    { name: "Leather Crossbody Bag", image: "Bag/bag2.jpeg" },
    { name: "Cotton Canvas Shoulder Bag", image: "Bag/bag3.jpeg" }
  ],
  "Pen Stand": [
    { name: "Wooden Desktop Pen Stand", image: "PenStand/penstand1.jpeg" },
    { name: "Ceramic Pen Holder", image: "PenStand/penstand2.jpeg" },
    { name: "Metallic Pen Stand", image: "PenStand/penstand3.jpeg" },
    { name: "Bamboo Organizer Pen Stand", image: "PenStand/penstand4.jpeg" }
  ],
  "Jewellery": [
    { name: "Handcrafted Silver Earrings", image: "Jewellery/jewellery1.jpeg" },
    { name: "Beaded Necklace Set", image: "Jewellery/jewellery2.jpeg" },
    { name: "Gold-plated Ring Collection", image: "Jewellery/jewellery3.jpeg" }
  ],
  "Diyas": [
    { name: "Clay Diya Set", image: "Diyas/diya1.jpeg" },
    { name: "Metal Diya with Embellishments", image: "Diyas/diya2.jpeg" },
    { name: "Ceramic Diya Collection", image: "Diyas/diya3.jpeg" },
    { name: "Colorful Glass Diya Set", image: "Diyas/diya4.jpeg" }
  ],
  "Bottle Art": [
    { name: "Painted Glass Bottle Vase", image: "BottleArt/bottleart1.jpeg" },
    { name: "Marble Effect Bottle Art", image: "BottleArt/bottleart2.jpeg" },
    { name: "Floral Patterned Bottle", image: "BottleArt/bottleart3.jpeg" }
  ]
};

async function updateProductData() {
  try {
    console.log("Updating product data with proper names and image mappings...");
    
    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");
    
    // Create new products with proper names and images
    let allProducts = [];
    
    for (const [category, products] of Object.entries(productData)) {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const basePrice = category === "Jewellery" ? 300 + Math.random() * 700 :
                         category === "Frames" ? 100 + Math.random() * 600 :
                         category === "Wall Hanging" ? 150 + Math.random() * 500 :
                         category === "Bag" ? 200 + Math.random() * 400 :
                         category === "Pen Stand" ? 50 + Math.random() * 200 :
                         category === "Diyas" ? 20 + Math.random() * 100 :
                         category === "Bottle Art" ? 100 + Math.random() * 400 : 100;
        
        const status = Math.random() > 0.3 ? "Available" : "Not Available";
        const offer = Math.random() > 0.5 ? Math.floor(Math.random() * 30) : 0;
        const quantity = Math.floor(Math.random() * 50) + 5;
        
        allProducts.push({
          name: product.name,
          sku: `${category.substring(0,3).toUpperCase()}${String(i+1).padStart(3,'0')}`,
          quantity: quantity,
          price: Math.round(basePrice),
          comparePrice: Math.round(basePrice * 1.2),
          image: product.image,
          images: [product.image],
          status: status,
          category: category,
          description: `Beautiful handcrafted ${product.name.toLowerCase()} made with quality materials. Perfect for adding artistic touch to your space.`,
          tags: [category, "handcrafted", "artistic", "decorative"],
          offer: offer,
          rating: (Math.random() * 3 + 2).toFixed(1),
          reviewCount: Math.floor(Math.random() * 50),
          lowStockThreshold: 5,
          trackInventory: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Insert all products
    await Product.insertMany(allProducts);
    console.log(`Successfully created ${allProducts.length} products with proper names and image mappings`);
    
    // Display summary
    console.log("\nProduct Summary by Category:");
    console.log("=".repeat(50));
    for (const category of Object.keys(productData)) {
      const count = allProducts.filter(p => p.category === category).length;
      console.log(`${category}: ${count} products`);
    }
    
  } catch (error) {
    console.error("Error updating product data:", error);
  } finally {
    await mongoose.connection.close();
  }
}

updateProductData();