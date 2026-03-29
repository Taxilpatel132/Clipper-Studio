import { Router } from "express";
import {
  getProjectController,
  saveProjectController,
  getAllProjectsController,
  getProjectThumbnailsController,
  deleteProjectController,
  renameProjectController
} from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protect, getAllProjectsController);
router.get("/thumbnails", protect, getProjectThumbnailsController);
router.post("/save", protect, saveProjectController);
router.get("/:projectId", protect, getProjectController);
router.delete("/:projectId", protect, deleteProjectController);
router.patch("/:projectId/rename", protect, renameProjectController);

export default router;
