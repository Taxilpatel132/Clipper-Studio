import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import Project from "../models/project.model.js";
const normalize = (p) => p.replace(/\\/g, "/");

const trimClip = (input, output, start, end) => {
  return new Promise((resolve, reject) => {
    const duration = end != null ? end - start : undefined;

    let command = ffmpeg(input).setStartTime(start || 0);

    if (duration) {
      command = command.setDuration(duration);
    }

    command
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-preset fast", "-crf 23"])
      .save(output)
      .on("end", resolve)
      .on("error", reject);
  });
};


export const renderMergeProject = async (projectId, userId) => {
  const project = await Project.findOne({
    _id: projectId,
    user: userId
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  project.status = "rendering";
  await project.save();

  const jobId = uuid();
  const jobDir = path.resolve("uploads", jobId);
 
const outputPath = path.resolve("outputs", `${jobId}.mp4`);


  fs.mkdirSync(jobDir, { recursive: true });

  /* 1️⃣ Download videos (basic local copy simulation) */
  const inputListPath = path.resolve(jobDir, "input.txt");
  let fileList = "";

  for (let i = 0; i < project.clips.length; i++) {
  const clip = project.clips[i];

  const sourcePath = normalize(path.resolve(clip.sourceUrl));
  const trimmedPath = normalize(
    path.join(jobDir, `trim${i}.mp4`)
  );

  const start = clip.trim?.start ?? 0;
  const end = clip.trim?.end;

  await trimClip(sourcePath, trimmedPath, start, end);

  fileList += `file '${normalize(path.resolve(trimmedPath))}'\n`;

}

  fs.writeFileSync(inputListPath, fileList);

  /* 2️⃣ Run FFmpeg */
await new Promise((resolve, reject) => {
  ffmpeg()
    .input(normalize(inputListPath))
    .inputOptions(["-f concat", "-safe 0"])
    .videoCodec("libx264")
    .audioCodec("aac")
    .outputOptions(["-preset fast", "-crf 23"])
    .save(normalize(outputPath))
    .on("end", resolve)
    .on("error", reject);
});

  /* 3️⃣ Update project status */
  project.status = "completed";
  await project.save();

  return {
    outputPath
  };
};
