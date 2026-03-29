import Project from "../models/project.model.js";

const CLOUDINARY_UPLOAD_SEGMENT = "/upload/";

function toCloudinaryFirstFrame(url) {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const [base, query = ""] = url.split("?");
  if (!base.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return url;
  }

  const transformed = base.replace(
    CLOUDINARY_UPLOAD_SEGMENT,
    `${CLOUDINARY_UPLOAD_SEGMENT}so_0/`
  );

  const jpgThumb = transformed.replace(/\.[^/.]+$/, ".jpg");
  return query ? `${jpgThumb}?${query}` : jpgThumb;
}

function getProjectThumbnailFromFirstClip(clips) {
  if (!Array.isArray(clips) || clips.length === 0) {
    return null;
  }

  const firstClip = clips[0];
  if (!firstClip?.sourceUrl) {
    return null;
  }

  if (firstClip.type === "video") {
    return toCloudinaryFirstFrame(firstClip.sourceUrl);
  }

  if (firstClip.type === "image" || firstClip.type === "background") {
    return firstClip.sourceUrl;
  }

  return null;
}

function estimateProjectSizeMb(clips) {
  if (!Array.isArray(clips) || clips.length === 0) {
    return 0;
  }

  return clips.reduce(
    (sum, clip) => sum + Math.round((clip?.duration || 0) * 2),
    0
  );
}

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

export const getAllProjectsWithThumbnails = async (userId) => {
  const projects = await getAllProjects(userId);

  return projects.map((project) => ({
    _id: project._id,
    projectName: project.projectName,
    duration: project.duration,
    updatedAt: project.updatedAt,
    thumbnailUrl: getProjectThumbnailFromFirstClip(project.clips),
    sizeMb: estimateProjectSizeMb(project.clips)
  }));
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