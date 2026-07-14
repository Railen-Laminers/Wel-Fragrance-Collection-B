const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const seedAdmin = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/wel-fragrance";

  const adminEmail =
    process.env.ADMIN_EMAIL || "admin@welfragrance.com";

  const adminPassword =
    process.env.ADMIN_PASSWORD || "Admin123!";

  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Drop the entire database
    await mongoose.connection.dropDatabase();
    console.log("🗑️ Database cleared successfully.");

    // Create admin user
    const adminUser = await User.create({
      firstName: "System",
      middleInitial: "A",
      lastName: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log(`✅ Admin created successfully: ${adminUser.email}`);
  } catch (error) {
    console.error("❌ Admin seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

seedAdmin();