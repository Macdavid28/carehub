import express from "express";
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
} from "../controllers/appointment.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("patient"), createAppointment)
  .get(protect, getAppointments);

router
  .route("/:id/status")
  .put(
    protect,
    authorize("doctor", "admin", "patient"),
    updateAppointmentStatus,
  );

export default router;
