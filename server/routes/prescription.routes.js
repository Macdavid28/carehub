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
import { uploadPhoto, resizePhoto } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/my-prescriptions", protect, getPatientPrescriptions);
router.post(
  "/",
  protect,
  authorize("doctor"),
  uploadPhoto,
  resizePhoto,
  createPrescription,
);
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
router.patch(
  "/:id",
  protect,
  authorize("doctor"),
  uploadPhoto,
  resizePhoto,
  updatePrescription,
);

export default router;
