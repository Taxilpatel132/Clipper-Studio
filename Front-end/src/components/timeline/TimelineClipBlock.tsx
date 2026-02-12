"use client";

import { cn } from "@/lib/utils";
import type { TimelineClip } from "@/editor/types";

interface TimelineClipBlockProps {
  clip: TimelineClip;
  isActive: boolean;
  isDragging: boolean;
  dragOffset: number;
  scale: number;
  onMouseDown: (e: React.MouseEvent, clipId: string) => void;
  onClick: (e: React.MouseEvent, clipId: string) => void;
  onTrimMouseDown: (
    e: React.MouseEvent,
    clipId: string,
    type: "start" | "end",
    clip: TimelineClip
  ) => void;
}

export function TimelineClipBlock({
  clip,
  isActive,
  isDragging,
  dragOffset,
  scale,
  onMouseDown,
  onClick,
  onTrimMouseDown,
}: TimelineClipBlockProps) {
  const fullWidth = clip.duration * scale;
  const left = clip.startTime * scale;
  const trimStartWidth = clip.trimStart * scale;
  const trimEndWidth = clip.trimEnd * scale;
  const fps = clip.fps ?? 1;

// Visible (non-trimmed) segment
const visibleStart = clip.trimStart;
const visibleDuration =
  clip.duration - clip.trimStart - clip.trimEnd;

// Frame calculation
const startFrame = Math.floor(visibleStart * fps);
const frameCount = Math.max(
  0,
  Math.floor(visibleDuration * fps)
);

const frames =
  clip.framesBaseUrl && frameCount > 0
    ? Array.from({ length: frameCount }, (_, i) => {
        const index = String(startFrame + i + 1).padStart(3, "0");
        return (
          <img
            key={i}
            src={`${clip.framesBaseUrl}/frame_${index}.jpg`}
            className="h-full w-auto object-cover pointer-events-none"
            draggable={false}
          />
        );
      })
    : null;
  return (
    <div
      className={cn(
        "absolute top-0 h-12 rounded border overflow-hidden select-none cursor-move transition-all",
        isActive
          ? "ring-2 ring-blue-400 border-blue-400"
          : "border-white/20 hover:border-white/40",
        isDragging && "opacity-70 z-50 scale-105 shadow-xl"
      )}
      style={{
        left: isDragging ? left + dragOffset : left,
        width: fullWidth,
        transform: isDragging ? "rotate(-2deg)" : "none",
      }}
      onMouseDown={(e) => onMouseDown(e, clip.id)}
      onClick={(e) => onClick(e, clip.id)}
    >
      {/* Trimmed start section */}
      <div
        className="absolute left-0 top-0 h-full bg-black/50 border-r border-white/20"
        style={{ width: trimStartWidth }}
      />

      {/* Trimmed end section */}
      <div
        className="absolute right-0 top-0 h-full bg-black/50 border-l border-white/20"
        style={{ width: trimEndWidth }}
      />

      {/* Active/visible section */}
     {/* Active / visible section */}
<div
  className="absolute top-0 h-full overflow-hidden"
  style={{
    left: trimStartWidth,
    width: fullWidth - trimStartWidth - trimEndWidth,
  }}
>
  {/* Frames */}
  {frames && (
    <div className="flex h-full">
      {frames}
    </div>
  )}

  {/* Overlay gradient (keeps design) */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 to-blue-500/40" />
</div>

      {/* Trim handle - start */}
      <div
        className="trim-handle absolute left-0 top-0 h-full w-3 cursor-ew-resize bg-yellow-500/20 hover:bg-yellow-500/40 z-20"
        onMouseDown={(e) => onTrimMouseDown(e, clip.id, "start", clip)}
      />

      {/* Trim handle - end */}
      <div
        className="trim-handle absolute right-0 top-0 h-full w-3 cursor-ew-resize bg-yellow-500/20 hover:bg-yellow-500/40 z-20"
        onMouseDown={(e) => onTrimMouseDown(e, clip.id, "end", clip)}
      />

      {/* Clip label */}
      <div className="absolute inset-0 flex items-center px-3 text-xs text-white font-medium truncate pointer-events-none">
        {clip.name}
      </div>
    </div>
  );
}