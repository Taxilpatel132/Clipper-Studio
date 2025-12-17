import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

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
    let command = ffmpeg(normalize(videoPath));

    if (start != null) command = command.setStartTime(start);
    if (end != null) command = command.setDuration(end - (start || 0));

    command
      .videoFilters(`fps=${fps}`)
      .output(path.join(outputDir, "frame_%03d.jpg"))
      .on("end", () => resolve(outputDir))
      .on("error", reject)
      .run();
  });
};
