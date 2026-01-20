import { Router } from "express";
import { renderProjectController,uploadPreviewFramesController } from "../controllers/render.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { timelineFramesController } from "../controllers/frame.controller.js";
import multer from 'multer';
const router = Router();
const upload = multer({
  dest: "uploads/temp" // temporary uploaded videos
});
router.post("/:projectId/render", protect, renderProjectController);

router.post('/upload-preview',
  upload.single("video"),
  uploadPreviewFramesController);

router.post(
  "/:projectId/frames",
  protect,
  timelineFramesController
);

export default router;
