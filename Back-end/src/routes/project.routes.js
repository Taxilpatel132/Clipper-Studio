import { Router } from "express";
import {
  getProjectController,
  saveProjectController,
  getAllProjectsController,
  deleteProjectController
} from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protect, getAllProjectsController);
router.post("/save", protect, saveProjectController);
router.get("/:projectId", protect, getProjectController);
router.delete("/:projectId", protect, deleteProjectController);

export default router;
