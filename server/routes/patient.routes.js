import express from "express";
import {
  getPatients,
  getPatientById,
  createPatientProfile,
  updatePatientProfile,
  getMyPatientProfile,
  deletePatientProfile,
} from "../controllers/patient.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("admin", "doctor"), getPatients)
  .post(protect, createPatientProfile);

router.route("/:id").delete(protect, deletePatientProfile);
router.get("/me", protect, getMyPatientProfile);

router
  .route("/:id")
  .get(protect, getPatientById)
  .put(protect, updatePatientProfile);

export default router;
