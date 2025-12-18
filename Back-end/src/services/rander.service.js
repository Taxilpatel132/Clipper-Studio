import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import ffmpegPath from "ffmpeg-static";
import Project from "../models/project.model.js";

const normalize = (p) => p.replace(/\\/g, "/");

const trimClip = (input, output, start, end) => {
  return new Promise((resolve, reject) => {
    const args = [];
    
    // Start time
    if (start != null && start > 0) {
      args.push("-ss", start.toString());
    }
    
    // Input
    args.push("-i", input);
    
    // Duration
    if (end != null) {
      const duration = end - (start || 0);
      args.push("-t", duration.toString());
    }
    
    // Codec and quality options
    args.push(
      "-c:v", "libx264",
      "-c:a", "aac",
      "-preset", "fast",
      "-crf", "23",
      "-y",
      output
    );

    const ffmpegProcess = spawn(ffmpegPath, args);
    
    let stderr = "";
    
    ffmpegProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg trim exited with code ${code}: ${stderr}`));
      }
    });
    
    ffmpegProcess.on("error", reject);
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
    const args = [
      "-f", "concat",
      "-safe", "0",
      "-i", normalize(inputListPath),
      "-c:v", "libx264",
      "-c:a", "aac",
      "-preset", "fast",
      "-crf", "23",
      "-y",
      normalize(outputPath)
    ];

    const ffmpegProcess = spawn(ffmpegPath, args);
    
    let stderr = "";
    
    ffmpegProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg concat exited with code ${code}: ${stderr}`));
      }
    });
    
    ffmpegProcess.on("error", reject);
  });

  /* 3️⃣ Update project status */
  project.status = "completed";
  await project.save();

  return {
    outputPath
  };
};
