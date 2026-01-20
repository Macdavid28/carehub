import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await Admin.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin already exists");
    } else {
      const admin = await Admin.create({
        name: process.env.NAME || "Admin",
        email: process.env.EMAIL || "admin@carehub.com",
        password: process.env.PASSWORD || "admin123",
        role: "admin",
        isVerified: true,
      });
      console.log("Admin seeded successfully:", admin.email);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
