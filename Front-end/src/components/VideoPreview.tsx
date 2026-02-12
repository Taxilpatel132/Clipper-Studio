"use client";

import { useEffect, useRef, useCallback } from "react";
import { useActiveSegment } from "@/editor/selectors";
import { usePlaybackActions } from "@/editor/actions";
import { globalToClipTime } from "@/editor/engine";
import { useEditorStore } from "@/editor/store/editor.store";

interface Props {
  onRemove?: () => void;
}

export default function VideoPreview({ onRemove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const clips = useEditorStore((s) => s.clips);
  const activeSegment = useActiveSegment();
  const { isPlaying, currentTime, pause, seekTo } = usePlaybackActions();

  /* ▶ Play / Pause sync */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeSegment?.type !== "clip") {
      video.pause();
      return;
    }

    isPlaying ? video.play().catch(() => {}) : video.pause();
  }, [isPlaying, activeSegment]);

  /* ⏱ Timeline → Video */
  useEffect(() => {
    if (activeSegment?.type !== "clip") return;
    const video = videoRef.current;
    if (!video) return;

    const clip = activeSegment.clip;
    const localTime = globalToClipTime(clip as any, currentTime);

    if (Math.abs(video.currentTime - localTime) > 0.1) {
      video.currentTime = Math.max(0, localTime);
    }
  }, [currentTime, activeSegment]);

  /* 🎞 Video → Timeline */
  const handleTimeUpdate = useCallback(() => {
    if (activeSegment?.type !== "clip") return;
    const video = videoRef.current;
    if (!video) return;

    const clip = activeSegment.clip;
    const playStart = clip.startTime + clip.trimStart;
    const playEnd = clip.startTime + clip.duration - clip.trimEnd;

    const globalTime = playStart + video.currentTime;
    seekTo(globalTime);

    if (globalTime >= playEnd - 0.05) {
      pause();
      seekTo(playEnd);
    }
  }, [activeSegment, seekTo, pause]);

  /* 🎬 Render */
  if (activeSegment?.type === "clip") {
    return (
      <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          src={activeSegment.clip.src}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          playsInline
        />
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full text-white/40"
        onClick={onRemove}
      >
        Upload a video to start
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-white/40">
      Empty segment
    </div>
  );
}