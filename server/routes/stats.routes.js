import express from "express";
import { getDashboardStats } from "../controllers/stats.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "doctor"), getDashboardStats);

export default router;
