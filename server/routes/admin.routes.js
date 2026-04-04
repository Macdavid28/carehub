import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  // Profile
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  // Users
  getAllUsers,
  // Doctors
  adminGetDoctors,
  adminCreateDoctor,
  adminUpdateDoctor,
  adminDeleteDoctor,
  // Patients
  adminGetPatients,
  adminGetPatientById,
  adminCreatePatient,
  adminUpdatePatient,
  adminDeletePatient,
  // Appointments
  adminGetAppointments,
  adminUpdateAppointment,
  adminDeleteAppointment,
  // Stats & Activity
  adminGetStats,
  getRecentActivity,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, authorize("admin"));

// ─── Profile ─────────────────────────────────
router
  .route("/profile")
  .get(getAdminProfile)
  .put(updateAdminProfile);

router.put("/change-password", changeAdminPassword);

// ─── Aggregated Users ─────────────────────────
router.get("/users", getAllUsers);

// ─── Doctors ─────────────────────────────────
router
  .route("/doctors")
  .get(adminGetDoctors)
  .post(adminCreateDoctor);

router
  .route("/doctors/:id")
  .put(adminUpdateDoctor)
  .delete(adminDeleteDoctor);

// ─── Patients ─────────────────────────────────
router
  .route("/patients")
  .get(adminGetPatients)
  .post(adminCreatePatient);

router
  .route("/patients/:id")
  .get(adminGetPatientById)
  .put(adminUpdatePatient)
  .delete(adminDeletePatient);

// ─── Appointments ─────────────────────────────
router
  .route("/appointments")
  .get(adminGetAppointments);

router
  .route("/appointments/:id")
  .put(adminUpdateAppointment)
  .delete(adminDeleteAppointment);

// ─── Stats & Activity ─────────────────────────
router.get("/stats", adminGetStats);
router.get("/activity", getRecentActivity);

export default router;
