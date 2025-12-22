"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useEditor } from "@/hooks/useEditor";

interface Props {
  newVideoSrc: string | null;
  onRemove?: () => void;
}

export default function VideoPreview({ newVideoSrc, onRemove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentClipSrc, setCurrentClipSrc] = useState<string | null>(null);

  const {
    isPlaying,
    currentTime,
    setCurrentTime,
    play,
    pause,
    addClip,
    clips,
  } = useEditor();

  // ▶️ Determine which clip should be playing based on current time OR show newly uploaded video
  useEffect(() => {
    // If there's a new video uploaded, show it immediately
    if (newVideoSrc) {
      setCurrentClipSrc(newVideoSrc);
      return;
    }

    // If no clips exist, show nothing
    if (clips.length === 0) {
      setCurrentClipSrc(null);
      return;
    }

    // Find the clip that should be playing at the current time
    for (const clip of clips) {
      const clipStart = clip.startTime;
      const clipEnd = clip.startTime + clip.duration;
      
      if (currentTime >= clipStart && currentTime < clipEnd) {
        if (currentClipSrc !== clip.src) {
          setCurrentClipSrc(clip.src);
        }
        return;
      }
    }
    
    // If no clip is found, show the last uploaded video or null
    setCurrentClipSrc(clips.length > 0 ? clips[clips.length - 1].src : null);
  }, [currentTime, clips, currentClipSrc, newVideoSrc]);

  // ▶️ Sync video source when clip changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClipSrc) return;
    
    // Only change source if it's different
    if (video.src !== currentClipSrc) {
      video.src = currentClipSrc;
    }
  }, [currentClipSrc]);

  // ▶️ Sync video time with the clip's relative time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClipSrc) return;
    
    // Find the current clip
    const currentClip = clips.find(clip => clip.src === currentClipSrc);
    if (!currentClip) return;
    
    // Calculate relative time within the clip
    const relativeTime = Math.max(0, currentTime - currentClip.startTime);
    
    if (Math.abs(video.currentTime - relativeTime) > 0.1) {
      video.currentTime = relativeTime;
    }
  }, [currentTime, currentClipSrc, clips]);
  // ▶️ Sync PLAY / PAUSE from store → video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentClipSrc) return;
    isPlaying ? video.play().catch(() => {}) : video.pause();
  }, [isPlaying, currentClipSrc]);

  // ▶️ Sync SEEK from store → video (removed because now handled above)

  // ▶️ Handle time update (video → store) - Update global time based on clip position
  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentClipSrc) return;
    
    // Find the current clip
    const currentClip = clips.find(clip => clip.src === currentClipSrc);
    if (!currentClip) return;
    
    // Calculate global time (clip start + video current time)
    const globalTime = currentClip.startTime + videoRef.current.currentTime;
    setCurrentTime(globalTime);
  };

  // ▶️ Handle metadata loaded (ADD CLIP, DO NOT CLEAR)
  const handleLoadedMetadata = () => {
    if (!videoRef.current || !currentClipSrc) return;

    // Check if this video is already in the clips to avoid duplicates
    const existingClip = clips.find(clip => clip.src === currentClipSrc);
    if (existingClip) return;

    const videoDuration = videoRef.current.duration;

    const lastClipEnd =
      clips.length === 0
        ? 0
        : clips[clips.length - 1].startTime +
          clips[clips.length - 1].duration;

    addClip({
      id: crypto.randomUUID(),
      name: `Video ${clips.length + 1}`,
      src: currentClipSrc,
      startTime: lastClipEnd,
      duration: videoDuration,
    });
  };

  // ▶️ Toggle play on click
  const handleTogglePlay = () => {
    if (!currentClipSrc) return;
    isPlaying ? pause() : play();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
      {currentClipSrc ? (
        <>
          <video
            ref={videoRef}
            src={currentClipSrc}
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
