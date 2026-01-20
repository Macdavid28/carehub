import express from "express";
import {
  getPatientPrescriptions,
  createPrescription,
  updatePrescriptionStatus,
  cancelPrescription,
  getPrescriptionsByPatientId,
  updatePrescription,
} from "../controllers/prescription.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-prescriptions", protect, getPatientPrescriptions);
router.post("/", protect, authorize("doctor"), createPrescription);
router.patch(
  "/:id/status",
  protect,
  authorize("doctor", "admin"),
  updatePrescriptionStatus,
);
router.patch("/:id/cancel", protect, authorize("doctor"), cancelPrescription);
router.get(
  "/patient/:patientId",
  protect,
  authorize("doctor", "admin"),
  getPrescriptionsByPatientId,
);
router.patch("/:id", protect, authorize("doctor"), updatePrescription);

export default router;
