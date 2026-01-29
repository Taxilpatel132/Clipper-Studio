"use client";

import { formatTime } from "@/editor/engine";
import { ZoomControls } from "./ZoomControls";

interface TimelineRulerProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
  scale: number;
  dropIndicatorPosition: number | null;
  clampTimeToSoftTrim: (time: number) => number;
  onClick: (e: React.MouseEvent) => void;
  onPlayheadMouseDown: (e: React.MouseEvent) => void;
}

export function TimelineRuler({
  duration,
  currentTime,
  isPlaying,
  zoom,
  scale,
  dropIndicatorPosition,
  clampTimeToSoftTrim,
  onClick,
  onPlayheadMouseDown,
}: TimelineRulerProps) {
  const safeTime = isPlaying ? currentTime : clampTimeToSoftTrim(currentTime);
  const playheadLeft = safeTime * scale;

  return (
    <div
      className="relative h-8 bg-[#0a0f24] border-b border-white/10"
      onClick={onClick}
    >
      {/* Ruler marks */}
      {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full border-l border-white/20"
          style={{ left: i * scale }}
        >
          <span className="absolute top-1 left-1 text-xs text-white/60">
            {formatTime(i)}
          </span>
        </div>
      ))}

      {/* Drop indicator */}
      {dropIndicatorPosition !== null && (
        <div
          className="absolute top-0 h-full w-0.5 bg-yellow-400 z-30"
          style={{ left: dropIndicatorPosition * scale }}
        />
      )}

      {/* Zoom controls */}
      <ZoomControls zoom={zoom} />

      {/* Playhead line */}
      <div
        className="absolute top-0 h-full w-0.5 bg-red-500 z-40"
        style={{ left: playheadLeft }}
      />

      {/* Playhead handle */}
      <div
        className="absolute top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-red-500 cursor-ew-resize z-50 hover:scale-110 transition-transform"
        style={{ left: playheadLeft }}
        onMouseDown={onPlayheadMouseDown}
      />
    </div>
  );
}