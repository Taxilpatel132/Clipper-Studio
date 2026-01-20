"use client";

import { useEffect, useRef, useState ,useMemo} from "react";
import { Play } from "lucide-react";
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
  const [currentClipSrc, setCurrentClipSrc] = useState<string | null>(null);

  const {
    isPlaying,
    currentTime,
    setCurrentTime,
    play,
    pause,
    addClip,
    clips,
    pendingVideoSrc,
    clearPendingVideo,  
  } = useEditor();

 
  useEffect(() => {
    if (pendingVideoSrc) {
      setCurrentClipSrc(pendingVideoSrc);
      return;
    }

    if (clips.length === 0) {
      setCurrentClipSrc(null);
      return;
    }

   for (const clip of clips) {
  const playStart = clip.startTime + clip.trimStart;
  const playEnd = clip.startTime + clip.duration - clip.trimEnd;

  if (currentTime >= playStart && currentTime < playEnd) {
    if (currentClipSrc !== clip.src) {
      setCurrentClipSrc(clip.src);
    }
    return;
  }
}
  
    // If no clip is found, show the last uploaded video or null
    setCurrentClipSrc(clips.length > 0 ? clips[clips.length - 1].src : null);
  }, [currentTime, clips, currentClipSrc, pendingVideoSrc]);
  const togglePlay = () => {
  isPlaying ? pause() : play();
};

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
   const playStart = currentClip.startTime + currentClip.trimStart;
const playEnd =
  currentClip.startTime +
  currentClip.duration -
  currentClip.trimEnd;

// Clamp global time into soft-trim window
let safeTime = currentTime;

if (safeTime < playStart) safeTime = playStart;
if (safeTime >= playEnd) safeTime = playEnd - 0.01;

// Map global → video time
const relativeTime = safeTime - playStart;

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

  const handleTimeUpdate = () => {
    if (!videoRef.current || !currentClipSrc) return;
    
    // Find the current clip
    const currentClip = clips.find(clip => clip.src === currentClipSrc);
    if (!currentClip) return;
    
    // Calculate global time (clip start + video current time)
   const playStart = currentClip.startTime + currentClip.trimStart;

// Global time = trim start + relative video time
const globalTime =
  playStart + videoRef.current.currentTime;

setCurrentTime(globalTime);
const playEnd =
  currentClip.startTime +
  currentClip.duration -
  currentClip.trimEnd;

if (globalTime >= playEnd) {
  pause(); // or later: jump to next clip
  setCurrentTime(playEnd);
  return;
}

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
  trimStart: 0,
  trimEnd: 0,
});

// ✅ clear upload preview ONLY after clip is added
clearPendingVideo();


  };

  const handleTogglePlay = () => {
    if (!currentClipSrc) return;
    isPlaying ? pause() : play();
  };
  const timelineSegments = useMemo(
  () => buildTimelineWithGaps(clips),
  [clips]
);
const activeSegment = useMemo(
  () => getActiveSegment(timelineSegments, currentTime),
  [timelineSegments, currentTime]
);
useEffect(() => {
  if (!isPlaying) return;
  if (!activeSegment || activeSegment.type !== "gap") return;

  let raf: number;
  let last = performance.now();

  const tick = (now: number) => {
    const delta = (now - last) / 1000;
    last = now;

    setCurrentTime((t) => t + delta);
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [activeSegment, isPlaying, setCurrentTime]);

   console.log("Timeline Segments:", timelineSegments);
   console.log("Active Segment:", activeSegment);
   console.log({ clips });
   console.log("Current Clip Src:", currentClipSrc);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">

  {/* 1️⃣ UPLOAD PREVIEW (BOOTSTRAP CLIP) */}
  {pendingVideoSrc && (
    <video
      ref={videoRef}
      src={pendingVideoSrc}
      className="w-full h-full object-contain"
      onLoadedMetadata={handleLoadedMetadata}
    />
  )}

  {/* 2️⃣ CLIP PLAYBACK */}
  {!pendingVideoSrc && activeSegment?.type === "clip" && (
    <>
      <video
        ref={videoRef}
        src={activeSegment.clip.src}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      />

      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <Play className="w-16 h-16 text-white opacity-80" />
        </button>
      )}
    </>
  )}

  {/* 3️⃣ GAP SEGMENT */}
  {!pendingVideoSrc && activeSegment?.type === "gap" && (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <span className="text-white/40 text-sm">Empty segment</span>
    </div>
  )}

  {/* 4️⃣ EMPTY STATE */}
  {!pendingVideoSrc && !activeSegment && clips.length === 0 && (
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
