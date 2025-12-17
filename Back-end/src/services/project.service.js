import Project from "../models/project.model.js";

export const saveProject = async ({
  userId,
  projectName,
  clips,
  timeline
}) => {
  const project = await Project.create({
    user: userId,
    projectName,
    clips,
    timeline
  });

  return project;
};
export const getProjectById = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    user: userId
  });

  return project;
};