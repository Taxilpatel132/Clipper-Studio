import { Router } from "express";
import { getProjectController, saveProjectController } from "../controllers/project.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/save", protect, saveProjectController);
router.get("/:projectId", protect, getProjectController);
export default router;
