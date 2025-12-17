import { extractTimelineFrames } from "../services/frame.service.js";
import Project from "../models/project.model.js";

export const timelineFramesController = async (req, res) => {
  const { projectId } = req.params;
  const { fps, start, end } = req.body;

  const project = await Project.findOne({
    _id: projectId,
    user: req.user._id
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  // for now: use first clip as preview source
  const videoPath = project.clips[0].sourceUrl;

  const dir = await extractTimelineFrames({
    videoPath,
    fps,
    start,
    end
  });

  res.json({
    message: "Timeline frames generated",
    directory: dir
  });
};
