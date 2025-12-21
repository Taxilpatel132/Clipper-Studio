"use client";
import { useRef } from "react";
import { useEditor } from "@/hooks/useEditor";
import { cn } from "@/lib/utils";
const TIMELINE_SCALE = 100; // px per second
export default function Timeline() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  const {
    currentTime,
    duration,
    setCurrentTime,
    clips,
    activeClipId,
    selectClip,
  } = useEditor();

  // ▶️ Convert mouse X → time
  const seekFromMouse = (clientX: number) => {
    if (!timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const time = x / TIMELINE_SCALE;

    setCurrentTime(Math.min(Math.max(time, 0), duration));
  };

  // ▶️ Click empty timeline → seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) return;
    seekFromMouse(e.clientX);
  };

  // ▶️ Drag playhead
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    seekFromMouse(e.clientX);
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
  };

  const playheadLeft = currentTime * TIMELINE_SCALE;

  return (
    <div className="w-full bg-[#0f1629] border-t border-white/10 px-4 py-3">
      {/* Header */}
      <div className="text-xs text-muted-foreground mb-2">
        Timeline
      </div>

      {/* Timeline Container */}
      <div className="overflow-x-auto">
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          className="relative h-20 bg-[#0a0f24] rounded-md min-w-full cursor-pointer"
          style={{
            width: Math.max(duration * TIMELINE_SCALE, 800),
          }}
        >
          {/* Time ruler */}
          {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-white/5"
              style={{ left: i * TIMELINE_SCALE }}
            >
              <span className="absolute top-1 left-1 text-[10px] text-white/40">
                {i}s
              </span>
            </div>
          ))}

          {/* Clips */}
          {clips.map((clip) => {
            const left = clip.startTime * TIMELINE_SCALE;
            const width = clip.duration * TIMELINE_SCALE;
            const isActive = clip.id === activeClipId;

            return (
              <div
                key={clip.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectClip(clip.id);
                }}
                className={cn(
                  "absolute top-10 h-8 rounded-md px-2 text-xs flex items-center cursor-pointer transition",
                  isActive
                    ? "bg-blue-500 ring-2 ring-blue-300"
                    : "bg-blue-400/70 hover:bg-blue-500"
                )}
                style={{ left, width }}
              >
                {clip.name}
              </div>
            );
          })}

          {/* Draggable Playhead */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              isDraggingRef.current = true;
            }}
            className="absolute top-0 h-full w-[3px] bg-red-500 cursor-ew-resize"
            style={{ left: playheadLeft }}
          />
        </div>
      </div>
    </div>
  );
}
