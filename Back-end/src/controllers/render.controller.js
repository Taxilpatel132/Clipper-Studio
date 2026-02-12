import { extractTimelineFrames } from "../services/frame.service.js";
import { v4 as uuid } from "uuid";

export const renderProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await renderMergeProject(
      projectId,
      req.user._id
    );

    res.status(200).json({
      message: "Render completed",
      output: result.outputPath
    });
  } catch (err) {
    console.error(err);

    if (err.message === "PROJECT_NOT_FOUND") {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(500).json({ message: "Render failed" });
  }
};


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
