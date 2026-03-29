import {
  saveProject,
  getProjectById,
  getAllProjects,
  getAllProjectsWithThumbnails,
  deleteProject,
  renameProject
} from "../services/project.service.js";

export const saveProjectController = async (req, res) => {
  try {
   const { projectId,projectName, clips, duration } = req.body;

   if (
  !projectName ||
  !Array.isArray(clips)
) {
  return res.status(400).json({
    message: "Invalid project data"
  });
}

    const project = await saveProject({
      userId: req.user._id,
      projectName,
      clips,
      duration,
      projectId
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


export const getAllProjectsController = async (req, res) => {
  try {
    const projects = await getAllProjects(req.user._id);
   
    res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch projects"
    });
  }
};

export const getProjectThumbnailsController = async (req, res) => {
  try {
    const projects = await getAllProjectsWithThumbnails(req.user._id);

    res.status(200).json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch project thumbnails"
    });
  }
};


export const deleteProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    const deleted = await deleteProject(projectId, req.user._id);

    if (!deleted) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      message: "Project deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to delete project"
    });
  }
};

export const renameProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { projectName } = req.body;

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({
        message: "Project name is required"
      });
    }

    const project = await renameProject(
      projectId,
      req.user._id,
      projectName.trim()
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.status(200).json({
      message: "Project renamed successfully",
      projectName: project.projectName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to rename project"
    });
  }
};
