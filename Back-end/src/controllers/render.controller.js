import { extractTimelineFrames } from "../services/frame.service.js";
import { v4 as uuid } from "uuid";



export const uploadPreviewFramesController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const fps = Number(req.body.fps) || 1;
    const tempId = uuid();

    const framesDir = await extractTimelineFrames({
      videoPath: req.file.path,
      fps,
      tempId
    });

  res.json({
  previewSessionId: tempId,
  fps,
  baseUrl: `http://localhost:5000/frames/${tempId}`
});
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Preview generation failed"
    });
  }
};
