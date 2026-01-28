"use client";

import { useEffect, useRef, useMemo } from "react";
import { useEditor } from "@/hooks/useEditor";
import {
  buildTimelineWithGaps,
  getActiveSegment,
} from "@/editor/timeline/timelineSegments";

interface Props {
  onRemove?: () => void;
}

export default function VideoPreview({ onRemove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    isPlaying,
    currentTime,
    setCurrentTime,
    pause,
    addClip,
    clips,
    pendingVideoSrc,
    clearPendingVideo,
  } = useEditor();

  /* -------------------------------------------------------
     Timeline → active segment
  ------------------------------------------------------- */

  const timelineSegments = useMemo(
    () => buildTimelineWithGaps(clips),
    [clips]
  );

  const activeSegment = useMemo(
    () => getActiveSegment(timelineSegments, currentTime),
    [timelineSegments, currentTime]
  );

  /* -------------------------------------------------------
     Sync PLAY / PAUSE (clip only)
  ------------------------------------------------------- */

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeSegment?.type !== "clip") {
      video.pause();
      return;
    }

    isPlaying ? video.play().catch(() => {}) : video.pause();
  }, [isPlaying, activeSegment]);

  /* -------------------------------------------------------
     Sync global time → video time (clip only)
  ------------------------------------------------------- */

  useEffect(() => {
    if (!activeSegment || activeSegment.type !== "clip") return;

    const video = videoRef.current;
    if (!video) return;

    const clip = activeSegment.clip;

    const playStart = clip.startTime + clip.trimStart;
    const playEnd =
      clip.startTime + clip.duration - clip.trimEnd;

    let safeTime = currentTime;
    if (safeTime < playStart) safeTime = playStart;
    if (safeTime >= playEnd) safeTime = playEnd - 0.01;

    const relativeTime = safeTime - playStart;

    if (Math.abs(video.currentTime - relativeTime) > 0.1) {
      video.currentTime = relativeTime;
    }
  }, [currentTime, activeSegment]);

  /* -------------------------------------------------------
     Video → timeline time (clip only)
  ------------------------------------------------------- */

  const handleTimeUpdate = () => {
    if (!activeSegment || activeSegment.type !== "clip") return;

    const video = videoRef.current;
    if (!video) return;

    const clip = activeSegment.clip;

    const playStart = clip.startTime + clip.trimStart;
    const playEnd =
      clip.startTime + clip.duration - clip.trimEnd;

    const globalTime = playStart + video.currentTime;
    setCurrentTime(globalTime);

    if (globalTime >= playEnd) {
      pause();
      setCurrentTime(playEnd);
    }
  };

  /* -------------------------------------------------------
     Upload bootstrap (unchanged)
  ------------------------------------------------------- */

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video || !pendingVideoSrc) return;

    const exists = clips.some((c) => c.src === pendingVideoSrc);
    if (exists) return;

    const lastEnd =
      clips.length === 0
        ? 0
        : Math.max(
            ...clips.map((c) => c.startTime + c.duration)
          );

    addClip({
      id: crypto.randomUUID(),
      name: `Video ${clips.length + 1}`,
      src: pendingVideoSrc,
      startTime: lastEnd,
      duration: video.duration,
      trimStart: 0,
      trimEnd: 0,
    });

    clearPendingVideo();
  };

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">

      {/* 1️⃣ Upload preview */}
      {pendingVideoSrc && (
        <video
          ref={videoRef}
          src={pendingVideoSrc}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {/* 2️⃣ Clip playback */}
      {!pendingVideoSrc && activeSegment?.type === "clip" && (
        <video
          ref={videoRef}
          src={activeSegment.clip.src}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
        />
      )}

      {/* 3️⃣ Gap */}
      {!pendingVideoSrc && activeSegment?.type === "gap" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <span className="text-white/40 text-sm">
            Empty segment
          </span>
        </div>
      )}

      {/* 4️⃣ Empty */}
      {!pendingVideoSrc && !activeSegment && clips.length === 0 && (
        <div
          className="flex flex-col items-center justify-center text-muted-foreground cursor-pointer"
          onClick={onRemove}
        >
          <p className="text-lg font-medium">Video Preview</p>
          <p className="text-sm opacity-70">
            Upload a video to get started
          </p>
        </div>
      )}
    </div>
  );
}
