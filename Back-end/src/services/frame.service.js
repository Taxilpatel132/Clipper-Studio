import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import ffmpegPath from "ffmpeg-static";

const normalize = (p) => p.replace(/\\/g, "/");

export const extractTimelineFrames = async ({
  videoPath,
  fps = 1,
  tempId
}) => {
  const outputDir = path.resolve(
    "outputs",
    "frames",
    tempId
  );

  fs.mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const args = [
      "-i", path.resolve(videoPath),
      "-vf", `fps=${fps}`,
      "-y",
      path.join(outputDir, "frame_%03d.jpg")
    ];

    const ffmpegProcess = spawn(ffmpegPath, args);
    
    let stderr = "";
    
    ffmpegProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(outputDir);
      } else {
        reject(new Error(`FFmpeg frame extraction exited with code ${code}: ${stderr}`));
      }
    });
    
    ffmpegProcess.on("error", reject);
  });
};
