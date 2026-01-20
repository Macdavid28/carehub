import express from "express";
import {
  getPatientMedicalRecords,
  createMedicalRecord,
  getMedicalRecordById,
  voidMedicalRecord,
  getMedicalRecordsByPatientId,
  updateMedicalRecord,
} from "../controllers/medical_record.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-records", protect, getPatientMedicalRecords);
router.post("/", protect, authorize("doctor"), createMedicalRecord);
router.get("/:id", protect, getMedicalRecordById);
router.patch("/:id/void", protect, authorize("doctor"), voidMedicalRecord);
router.get(
  "/patient/:patientId",
  protect,
  authorize("doctor", "admin"),
  getMedicalRecordsByPatientId,
);
router.patch("/:id", protect, authorize("doctor"), updateMedicalRecord);

export default router;
