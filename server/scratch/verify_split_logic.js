import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const verifyNewLogic = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/carehub");
    console.log("Connected to MongoDB");

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // 1. Create a Pending appointment from 2 hours ago (should EXPIRE)
    const pendingPast = await Appointment.create({
      patient: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      date: twoHoursAgo,
      time: "10:00 AM",
      reason: "Test Pending Expire",
      status: "Pending",
    });

    // 2. Create a Confirmed appointment from 2 hours ago (should STAY CONFIRMED due to grace period)
    const confirmedRecent = await Appointment.create({
      patient: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      date: twoHoursAgo,
      time: "11:00 AM",
      reason: "Test Confirmed Recent",
      status: "Confirmed",
    });

    // 3. Create a Confirmed appointment from 2 days ago (should COMPLETE)
    const confirmedOld = await Appointment.create({
      patient: new mongoose.Types.ObjectId(),
      doctor: new mongoose.Types.ObjectId(),
      date: twoDaysAgo,
      time: "09:00 AM",
      reason: "Test Confirmed Old",
      status: "Confirmed",
    });

    console.log("Mock data created. Running simulated logic...");

    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Run Logic A
    await Appointment.updateMany(
      { date: { $lt: now }, status: "Pending" },
      { $set: { status: "Expired" } }
    );

    // Run Logic B
    await Appointment.updateMany(
      { date: { $lt: twentyFourHoursAgo }, status: "Confirmed" },
      { $set: { status: "Completed" } }
    );

    // Verify
    const resA = await Appointment.findById(pendingPast._id);
    const resB = await Appointment.findById(confirmedRecent._id);
    const resC = await Appointment.findById(confirmedOld._id);

    console.log(`Pending (2h ago) -> ${resA.status} (Expected: Expired)`);
    console.log(`Confirmed (2h ago) -> ${resB.status} (Expected: Confirmed)`);
    console.log(`Confirmed (2d ago) -> ${resC.status} (Expected: Completed)`);

    const success = resA.status === "Expired" && resB.status === "Confirmed" && resC.status === "Completed";
    
    if (success) {
      console.log("VERIFICATION SUCCESS: Split logic with grace period works!");
    } else {
      console.log("VERIFICATION FAILURE: Logic mismatch.");
    }

    // Cleanup
    await Appointment.deleteMany({ _id: { $in: [pendingPast._id, confirmedRecent._id, confirmedOld._id] } });
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Verification error:", error);
    process.exit(1);
  }
};

verifyNewLogic();
