import { Router } from "express";
import { uploadPreviewFramesController,downloadProject } from "../controllers/render.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import multer from 'multer';
const router = Router();
const upload = multer({
  dest: "uploads/temp" // temporary uploaded videos
});


router.post('/upload-preview',
  upload.single("video"),
  uploadPreviewFramesController);

router.get("/download/:projectId", protect,downloadProject)
export default router;
