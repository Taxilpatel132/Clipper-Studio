import { Router } from "express";
import { renderProjectController } from "../controllers/render.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { timelineFramesController } from "../controllers/frame.controller.js";
const router = Router();

router.post("/:projectId/render", protect, renderProjectController);
router.post(
  "/:projectId/frames",
  protect,
  timelineFramesController
);
export default router;
