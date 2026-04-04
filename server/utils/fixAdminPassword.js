import Admin from "../models/admin.model.js";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "../config/db.js";

dotenv.config({ path: "../.env" });

const fixAdminPassword = async () => {
  try {
    await connectDB();

    const admin = await Admin.findOne({ role: "admin" });
    if (!admin) {
      console.log("No admin found. Run: npm run admin");
      process.exit(0);
    }

    const isAlreadyHashed = admin.password.startsWith("$2b$") || admin.password.startsWith("$2a$");
    if (isAlreadyHashed) {
      console.log("✅ Admin password is already hashed. No fix needed.");
      process.exit(0);
    }

    console.log("⚠️  Admin password is plaintext. Hashing now...");
    const salt = await bcryptjs.genSalt(10);
    admin.password = await bcryptjs.hash(admin.password, salt);
    await admin.save();
    console.log("✅ Admin password fixed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixAdminPassword();
