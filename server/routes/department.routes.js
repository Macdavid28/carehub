import express from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload, { resizeDepartmentPhoto } from "../middleware/upload.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(getDepartments)
  .post(
    protect,
    authorize("admin"),
    upload.single("image"),
    resizeDepartmentPhoto,
    createDepartment,
  );

router
  .route("/:id")
  .put(
    protect,
    authorize("admin"),
    upload.single("image"),
    resizeDepartmentPhoto,
    updateDepartment,
  )
  .delete(protect, authorize("admin"), deleteDepartment);

export default router;
