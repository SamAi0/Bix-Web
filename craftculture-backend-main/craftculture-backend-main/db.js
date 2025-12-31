const mongoose = require("mongoose");
require("dotenv").config();
const REMOTE_DB_URL = process.env.REMOTE_DB_URL;

if (!REMOTE_DB_URL) {
  console.error("ERROR: REMOTE_DB_URL not found in environment variables");
  process.exit(1);
}

mongoose.connect(REMOTE_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("connected", function () {
  console.log("Database is connected...");
});

db.on("disconnected", function () {
  console.log("Database is disconnected...");
});

db.on("error", function (err) {
  console.error("Database connection error:", err);
});

module.exports = db;
