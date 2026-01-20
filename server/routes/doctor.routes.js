import express from "express";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctor.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getDoctors)
  .post(protect, authorize("admin"), createDoctor);

router
  .route("/:id")
  .get(getDoctorById)
  .put(protect, updateDoctor) // Authorization logic inside controller for owner/admin
  .delete(protect, authorize("admin"), deleteDoctor);

export default router;
