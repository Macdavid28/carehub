import cron from "node-cron";
import Appointment from "../models/appointment.model.js";

/**
 * Initializes cron jobs to handle past appointments:
 * 1. Mark "Pending" appointments as "Expired" immediately after the date has passed.
 * 2. Mark "Confirmed" appointments as "Completed" after a 24-hour grace period,
 *    assuming the appointment held unless manually updated.
 */
export const initCronJobs = () => {
  // Run every hour at the beginning of the hour
  cron.schedule("0 * * * *", async () => {
    console.log("Running cron job: Auditing past appointments...");
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Logic A: Pending -> Expired (Immediate)
      const expiredResult = await Appointment.updateMany(
        {
          date: { $lt: now },
          status: "Pending",
        },
        {
          $set: { status: "Expired" },
        },
      );

      // Logic B: Confirmed -> Completed (24-hour Grace Period)
      const completedResult = await Appointment.updateMany(
        {
          date: { $lt: twentyFourHoursAgo },
          status: "Confirmed",
        },
        {
          $set: { status: "Completed" },
        },
      );

      if (expiredResult.modifiedCount > 0 || completedResult.modifiedCount > 0) {
        console.log("Cron Job Audit Success:");
        if (expiredResult.modifiedCount > 0) {
          console.log(`- ${expiredResult.modifiedCount} Pending appointments -> Expired`);
        }
        if (completedResult.modifiedCount > 0) {
          console.log(`- ${completedResult.modifiedCount} Confirmed appointments -> Completed`);
        }
      }
    } catch (error) {
      console.error("Cron Job Error:", error);
    }
  });

  console.log("Cron jobs initialized.");
};
