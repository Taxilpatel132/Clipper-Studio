import Project from "../models/project.model.js";

export const saveProject = async ({
  userId,
  projectName,
  clips,
  duration,
  projectId
}) => {

  if (projectId) {
    return await Project.findOneAndUpdate(
      { _id: projectId, user: userId },
      { projectName, clips, duration },
      { new: true }
    );
  }

  return await Project.create({
    user: userId,
    projectName,
    clips,
    duration
  });
};
export const getProjectById = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    user: userId
  });

  return project;
};

export const getAllProjects = async (userId) => {
  console.log("Fetching projects for user:", userId);
  return await Project.find({ user: userId })
    .sort({ updatedAt: -1 })
    .lean();
};

export const deleteProject = async (projectId, userId) => {
  return await Project.findOneAndDelete({
    _id: projectId,
    user: userId
  });
};

export const renameProject = async (projectId, userId, newName) => {
  return await Project.findOneAndUpdate(
    { _id: projectId, user: userId },
    { projectName: newName },
    { new: true }
  );
};