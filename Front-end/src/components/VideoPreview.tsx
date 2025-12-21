"use client";

import { useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { useEditor } from "@/hooks/useEditor";

interface Props {
  src: string | null;
  onRemove?: () => void;
}

export default function VideoPreview({ src, onRemove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const {
    isPlaying,
    currentTime,
    setCurrentTime,
    play,
    pause,
    addClip,
    clips,
  } = useEditor();

  // ▶️ Sync PLAY / PAUSE from store → video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    isPlaying ? video.play().catch(() => {}) : video.pause();
  }, [isPlaying]);

  // ▶️ Sync SEEK from store → video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.05) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  // ▶️ Handle time update (video → store)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  // ▶️ Handle metadata loaded (ADD CLIP, DO NOT CLEAR)
  const handleLoadedMetadata = () => {
    if (!videoRef.current || !src) return;

    const videoDuration = videoRef.current.duration;

    const lastClipEnd =
      clips.length === 0
        ? 0
        : clips[clips.length - 1].startTime +
          clips[clips.length - 1].duration;

    addClip({
      id: crypto.randomUUID(),
      name: `Video ${clips.length + 1}`,
      src,
      startTime: lastClipEnd,
      duration: videoDuration,
    });
  };

  // ▶️ Toggle play on click
  const handleTogglePlay = () => {
    if (!src) return;
    isPlaying ? pause() : play();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
      {src ? (
        <>
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handleTogglePlay}
          />

          {!isPlaying && (
            <button
              onClick={handleTogglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
            >
              <Play className="w-16 h-16 text-white opacity-80" />
            </button>
          )}
        </>
      ) : (
        <div
          className="flex flex-col items-center justify-center text-muted-foreground cursor-pointer"
          onClick={onRemove}
        >
          <p className="text-lg font-medium">Video Preview</p>
          <p className="text-sm opacity-70">Upload a video to get started</p>
        </div>
      )}
    </div>
  );
}
