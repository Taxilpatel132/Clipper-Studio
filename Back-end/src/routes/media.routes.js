import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadMedia } from "../controllers/media.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/upload", protect, upload.single("file"), uploadMedia);

export default router;