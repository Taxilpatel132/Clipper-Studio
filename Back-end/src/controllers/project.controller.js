import { saveProject,getProjectById } from "../services/project.service.js";

export const saveProjectController = async (req, res) => {
  try {
    const { projectName, clips, timeline } = req.body;

    if (
      !projectName ||
      !Array.isArray(clips) ||
      clips.length === 0 ||
      !timeline
    ) {
      return res.status(400).json({
        message: "Invalid project data"
      });
    }

    const project = await saveProject({
      userId: req.user._id,
      projectName,
      clips,
      timeline
    });

    res.status(201).json({
      message: "Project saved successfully",
      projectId: project._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to save project"
    });
  }
};


export const getProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await getProjectById(
      projectId,
      req.user._id
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to load project"
    });
  }
};
