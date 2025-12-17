import { renderMergeProject } from "../services/rander.service.js";

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
