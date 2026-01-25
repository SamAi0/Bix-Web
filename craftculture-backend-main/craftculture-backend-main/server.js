const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();
const User = require("./models/User");
const bcrypt = require("bcrypt");
const userRouter = require("./routes/userRouter");
const productRouter = require("./routes/productRouter");
const orderRouter = require("./routes/orderRouter");
const companyRouter = require("./routes/companyRouter");
const jobRouter = require("./routes/jobRouter");
const donateMoneyRouter = require("./routes/donateMoneyRouter");
const donateProductRouter = require("./routes/donateProductRouter");
const applicantRouter = require("./routes/applicantRouter");
const dashboardRouter = require("./routes/dashboardRouter");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

// Routes
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/companies", companyRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/applicants", applicantRouter);
app.use("/api/donate-money", donateMoneyRouter);
app.use("/api/donate-product", donateProductRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reviews", require("./routes/reviewRouter"));

// Function to create default admin user if none exists
const createDefaultAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ userRole: "ADMIN" });
    
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const adminUser = new User({
        username: "admin",
        email: "admin@craftculture.com",
        password: hashedPassword,
        userRole: "ADMIN"
      });
      
      await adminUser.save();
      console.log("Default admin user created:");
      console.log("Username: admin");
      console.log("Password: admin123");
      console.log("Email: admin@craftculture.com");
    } else {
      console.log(`Found ${adminCount} admin user(s). Skipping default admin creation.`);
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
};

// Connect to database and create default admin

// Wait for database connection to be established
db.once('open', async () => {
  await createDefaultAdmin();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Handle connection errors
db.on('error', (err) => {
  console.error("Database connection error:", err);
});
