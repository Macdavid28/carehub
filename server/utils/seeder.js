import "dotenv/config";
import Admin from "../models/admin.model.js";
import bcryptjs from "bcryptjs";
import connectDB from "../config/db.js";


const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await Admin.findOne({ role: "admin" });

    if (adminExists) {
      console.log("unable to create admin with provided details");
    } else {
      const rawPassword = process.env.PASSWORD;
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(rawPassword, salt);

      const admin = await Admin.create({
        name: process.env.NAME,
        email: process.env.EMAIL,
        password: hashedPassword,
        role: "admin",
      });

      console.log("admin seeding successful: ");
    }

    process.exit(0);
  } catch (error) {
    console.error("error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();

