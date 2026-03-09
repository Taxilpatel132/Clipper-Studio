import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import ffmpegPath from "ffmpeg-static";
import Project from "../models/project.model.js";

const normalize = (p) => p.replace(/\\/g, "/");
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function escapeText(text = "") {
  return text
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

function validateClip(clip) {
  if (!clip) throw new Error("Invalid clip");
  if (!clip.type) throw new Error("Clip missing type");
  if (clip.type !== "text" && clip.type !== "background") {
    if (!clip.sourceUrl) throw new Error("Clip missing sourceUrl");
  }
}
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


export async function renderTimeline(project) {
  try {
    if (!project) throw new Error("Project is undefined");
    if (!Array.isArray(project.clips))
      throw new Error("Project clips invalid");

    const clips = project.clips;
    const duration = project.duration || 10;

    const videos = clips.filter(c => c.type === "video");
    const images = clips.filter(c => c.type === "image");
    const texts = clips.filter(c => c.type === "text");
    const backgrounds = clips.filter(c => c.type === "background");
    const audios = clips.filter(c => c.type === "audio");

    const inputs = [];
    const filters = [];
    const audioFilters = [];

    let inputIndex = 0;

    ensureDir("renders");

    /* BASE CANVAS */
    filters.push(`color=c=black:s=1920x1080:d=${duration}[base]`);
    let lastVideo = "base";

    /* BACKGROUND */
    backgrounds.forEach((bg, i) => {
      try {
        validateClip(bg);

        const start = bg.startTime || 0;
        const end = start + (bg.duration || duration);

        const color = bg.backgroundColor || "black";

        filters.push(
          `color=c=${color}:s=1920x1080:d=${bg.duration || duration}[bg${i}]`
        );

        filters.push(
          `[${lastVideo}][bg${i}]overlay=enable='between(t,${start},${end})'[vbg${i}]`
        );

        lastVideo = `vbg${i}`;
      } catch (err) {
        console.error("Background error:", err.message);
      }
    });

    /* VIDEO */
    videos.forEach((clip, i) => {
      try {
        validateClip(clip);

        inputs.push("-i", clip.sourceUrl);

        const start = clip.startTime || 0;
        const end = start + (clip.duration || 5);

        filters.push(
          `[${inputIndex}:v]setpts=PTS+${start}/TB[v${i}]`
        );

        filters.push(
          `[${lastVideo}][v${i}]overlay=enable='between(t,${start},${end})'[vv${i}]`
        );

        lastVideo = `vv${i}`;
        inputIndex++;
      } catch (err) {
        console.error("Video error:", err.message);
      }
    });

    /* IMAGE */
    images.forEach((clip, i) => {
      try {
        validateClip(clip);

        inputs.push("-i", clip.sourceUrl);

        const start = clip.startTime || 0;
        const end = start + (clip.duration || 5);

        filters.push(
          `[${inputIndex}:v]setpts=PTS+${start}/TB[img${i}]`
        );

        filters.push(
          `[${lastVideo}][img${i}]overlay=enable='between(t,${start},${end})'[vi${i}]`
        );

        lastVideo = `vi${i}`;
        inputIndex++;
      } catch (err) {
        console.error("Image error:", err.message);
      }
    });

    /* TEXT */
    texts.forEach((clip, i) => {
      try {
        const start = clip.startTime || 0;
        const end = start + (clip.duration || 5);

        const safeText = escapeText(clip.text || "");

        filters.push(
          `[${lastVideo}]drawtext=text='${safeText}':fontsize=${clip.fontSize || 48}:fontcolor=${clip.color || "white"}:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,${start},${end})'[vt${i}]`
        );

        lastVideo = `vt${i}`;
      } catch (err) {
        console.error("Text error:", err.message);
      }
    });

    /* AUDIO */
    audios.forEach((clip, i) => {
      try {
        validateClip(clip);

        inputs.push("-i", clip.sourceUrl);

        const delay = (clip.startTime || 0) * 1000;

        audioFilters.push(
          `[${inputIndex}:a]adelay=${delay}|${delay},volume=${clip.volume ?? 1}[a${i}]`
        );

        inputIndex++;
      } catch (err) {
        console.error("Audio error:", err.message);
      }
    });

    let finalAudio = null;

    if (audioFilters.length) {
      filters.push(...audioFilters);

      const mixInputs = audios.map((_, i) => `[a${i}]`).join("");

      filters.push(`${mixInputs}amix=inputs=${audios.length}[aout]`);

      finalAudio = "aout";
    }

    const outputPath = path.join(
      process.cwd(),
      "renders",
      `${project._id}.mp4`
    );

    const args = [
      ...inputs,
      "-filter_complex",
      filters.join(";"),
      "-map",
      `[${lastVideo}]`
    ];

    if (finalAudio) args.push("-map", `[${finalAudio}]`);

    args.push(
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-y",
      outputPath
    );

    console.log("FFmpeg args:", args.join(" "));

    return new Promise((resolve, reject) => {
      const ff = spawn(ffmpegPath, args);

      ff.stderr.on("data", d => {
        console.log(d.toString());
      });

      ff.on("error", err => {
        reject(new Error("FFmpeg spawn error: " + err.message));
      });

      ff.on("close", code => {
        if (code !== 0) {
          return reject(new Error(`FFmpeg exited with code ${code}`));
        }

        if (!fs.existsSync(outputPath)) {
          return reject(new Error("Render failed, file not created"));
        }

        resolve(outputPath);
      });
    });
  } catch (err) {
    console.error("RenderTimeline error:", err);
    throw err;
  }
} 