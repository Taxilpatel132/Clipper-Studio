"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePlaybackLayers } from "@/editor/selectors/timeline.selectors";
import { usePlaybackActions } from "@/editor/actions";
import { globalToClipTime } from "@/editor/engine";
import { useEditorStore } from "@/editor/store/editor.store";

interface Props {
  onRemove?: () => void;
}

export default function VideoPreview({ onRemove }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const clips = useEditorStore((s) => s.clips);
const layers = usePlaybackLayers();
  const { isPlaying, currentTime, pause, seekTo } = usePlaybackActions();

  /* ▶ Play / Pause sync */
 useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  if (!layers.video) {
    video.pause();
    return;
  }

  isPlaying ? video.play().catch(() => {}) : video.pause();
}, [isPlaying, layers.video]);
  /* ⏱ Timeline → Video */
 useEffect(() => {
  if (!layers.video) return;
  const video = videoRef.current;
  if (!video) return;

  const clip = layers.video;
  const localTime = globalToClipTime(clip as any, currentTime);

  if (Math.abs(video.currentTime - localTime) > 0.1) {
    video.currentTime = Math.max(0, localTime);
  }
}, [currentTime, layers.video]);
  /* 🎞 Video → Timeline */
const handleTimeUpdate = useCallback(() => {
  if (!layers.video) return;
  const video = videoRef.current;
  if (!video) return;

  const clip = layers.video;

  const playStart = clip.startTime + clip.trimStart;
  const playEnd = clip.startTime + clip.duration - clip.trimEnd;

  const globalTime = playStart + video.currentTime;
  seekTo(globalTime);

  if (globalTime >= playEnd - 0.05) {
    pause();
    seekTo(playEnd);
  }
}, [layers.video, seekTo, pause]);
useEffect(() => {
  const activeIds = new Set(layers.audio.map(c => c.id));

  // STOP removed audio (important for split)
  Object.keys(audioRefs.current).forEach((id) => {
    if (!activeIds.has(id)) {
      const audio = audioRefs.current[id];
      audio.pause();
      audio.currentTime = 0;
      delete audioRefs.current[id];
    }
  });

  layers.audio.forEach((clip) => {
    let audio = audioRefs.current[clip.id];

    if (!audio) {
      audio = new Audio(clip.src);
      audioRefs.current[clip.id] = audio;
    }

    const localTime = globalToClipTime(clip, currentTime);

    if (Math.abs(audio.currentTime - localTime) > 0.1) {
      audio.currentTime = Math.max(0, localTime);
    }

    audio.volume = clip.muted ? 0 : (clip.volume ?? 1);

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

}, [layers.audio, currentTime, isPlaying]);
  /* 🎬 Render */
 

  /* 🎬 Render */
  console.log("Current Time:", currentTime);
console.log("Overlays:", layers.overlays);
console.log("Backgrounds:", layers.backgrounds);
console.log("layers:", layers);
return (
  <div className="relative w-full h-full bg-black rounded-xl overflow-hidden" >

    {/* 🎨 Background */}
   {/* 🎨 Background */}
{layers.backgrounds.map((clip) => (
  <div
    key={clip.id}
    className="absolute inset-0"
    style={{
      background: clip.backgroundColor || "#000",
      opacity: clip.opacity ?? 1,
    }}
  />
))}

    {/* 🎥 Video */}
    {layers.video && (
      <video
        ref={videoRef}
        src={layers.video.src}
        className="absolute inset-0 w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        playsInline
      />
    )}

    {/* 🖼 Image Overlays */}
    {layers.overlays
      .filter((c) => c.type === "image")
      .map((clip) => (
        <img
          key={clip.id}
          src={clip.src}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ opacity: clip.opacity ?? 1 }}
        />
      ))}

    {/* ✍️ Text Overlays */}
    {layers.overlays
      .filter((c) => c.type === "text")
      .map((clip) => (
        <div
          key={clip.id}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            color: clip.color || "#fff",
            fontSize: clip.fontSize || 48,
            opacity: clip.opacity ?? 1,
          }}
        >
          {clip.text}
        </div>
      ))}

    {/* Empty State */}
    {!layers.video && clips.length === 0 && (
      <div
        className="flex items-center justify-center h-full text-white/40"
        onClick={onRemove}
      >
        Upload a video to start
      </div>
    )}

  </div>
);
}