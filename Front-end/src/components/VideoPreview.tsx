"use client";

import { useEffect, useRef, useCallback } from "react";

// ✅ Import from organized folders
import { useEditorStore } from "@/editor/store/editor.store";
import { useActiveSegment } from "@/editor/selectors";
import { usePlaybackActions } from "@/editor/actions";
import { globalToClipTime } from "@/editor/engine";

interface Props {
  onRemove?: () => void;
}

export default function VideoPreview({ onRemove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // From store (raw state)
  const clips = useEditorStore((state) => state.clips);
  const pendingVideoSrc = useEditorStore((state) => state.pendingVideoSrc);
  const addClip = useEditorStore((state) => state.addClip);
  const clearPendingVideo = useEditorStore((state) => state.clearPendingVideo);

  // From selectors
  const activeSegment = useActiveSegment();

  // From actions
  const { isPlaying, currentTime, pause, seekTo } = usePlaybackActions();

  /* -------------------------------------------------------
     Sync PLAY / PAUSE
  ------------------------------------------------------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeSegment?.type !== "clip") {
      video.pause();
      return;
    }

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, activeSegment]);

  /* -------------------------------------------------------
     Sync global time → video time
  ------------------------------------------------------- */
  useEffect(() => {
    if (!activeSegment || activeSegment.type !== "clip") return;

    const video = videoRef.current;
    if (!video) return;

    const clip = activeSegment.clip;
    const localTime = globalToClipTime(clip as any, currentTime);

    if (Math.abs(video.currentTime - localTime) > 0.1) {
      video.currentTime = Math.max(0, localTime);
    }
  }, [currentTime, activeSegment]);

  /* -------------------------------------------------------
     Video → timeline time
  ------------------------------------------------------- */
  const handleTimeUpdate = useCallback(() => {
    if (!activeSegment || activeSegment.type !== "clip") return;

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

  /* -------------------------------------------------------
     Handle new video upload
  ------------------------------------------------------- */
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !pendingVideoSrc) return;

    const exists = clips.some((c) => c.src === pendingVideoSrc);
    if (exists) {
      clearPendingVideo();
      return;
    }

    const lastEnd =
      clips.length === 0
        ? 0
        : Math.max(...clips.map((c) => c.startTime + c.duration));

    addClip({
      id: crypto.randomUUID(),
      name: `Video ${clips.length + 1}`,
      src: pendingVideoSrc,
      startTime: lastEnd,
      duration: video.duration,
      trimStart: 0,
      trimEnd: 0,
      type: "video",
    });

    clearPendingVideo();
  }, [pendingVideoSrc, clips, addClip, clearPendingVideo]);

  /* -------------------------------------------------------
     Render (Keep your existing UI/CSS)
  ------------------------------------------------------- */
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Upload preview */}
      {pendingVideoSrc && (
        <video
          ref={videoRef}
          src={pendingVideoSrc}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {/* Clip playback */}
      {!pendingVideoSrc && activeSegment?.type === "clip" && (
        <video
          ref={videoRef}
          src={activeSegment.clip.src}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
        />
      )}

      {/* Gap placeholder */}
      {!pendingVideoSrc && activeSegment?.type === "gap" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <span className="text-white/40 text-sm">Empty segment</span>
        </div>
      )}

      {/* Empty state */}
      {!pendingVideoSrc && !activeSegment && clips.length === 0 && (
        <div
          className="flex flex-col items-center justify-center h-full text-muted-foreground cursor-pointer"
          onClick={onRemove}
        >
          <p className="text-lg font-medium">Video Preview</p>
          <p className="text-sm opacity-70">Upload a video to get started</p>
        </div>
      )}
    </div>
  );
}