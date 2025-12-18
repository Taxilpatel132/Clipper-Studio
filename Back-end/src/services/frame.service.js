import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import ffmpegPath from "ffmpeg-static";

const normalize = (p) => p.replace(/\\/g, "/");

export const extractTimelineFrames = async ({
  videoPath,
  fps = 1,
  start,
  end
}) => {
  const jobId = uuid();
  const outputDir = path.resolve("outputs", "frames", jobId);

  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const args = [];
    
    // Input options
    if (start != null) {
      args.push("-ss", start.toString());
    }
    
    args.push("-i", videoPath);
    
    // Duration
    if (end != null) {
      const duration = end - (start || 0);
      args.push("-t", duration.toString());
    }
    
    // Video filter for FPS
    args.push("-vf", `fps=${fps}`);
    
    // Output
    args.push("-y", path.join(outputDir, "frame_%03d.jpg"));

    const ffmpegProcess = spawn(ffmpegPath, args);
    
    let stderr = "";
    
    ffmpegProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(outputDir);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });
    
    ffmpegProcess.on("error", reject);
  });
};
