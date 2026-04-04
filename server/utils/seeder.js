import Admin from "../models/admin.model.js";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

dotenv.config({ path: "../.env" });

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await Admin.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin already exists:", adminExists.email);
    } else {
      const rawPassword = process.env.PASSWORD || "admin123";
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(rawPassword, salt);

      const admin = await Admin.create({
        name: process.env.NAME || "Admin",
        email: process.env.EMAIL || "admin@carehub.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin seeded successfully:", admin.email);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();

