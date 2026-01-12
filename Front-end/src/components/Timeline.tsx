"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/editor/store/editor.store";

const TIMELINE_SCALE = 100; // px per second

export default function Timeline() {
  // ───────────────────────────────── refs
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef(false);

  const trimTypeRef = useRef<"start" | "end" | null>(null);
  const trimClipIdRef = useRef<string | null>(null);
  const trimStartXRef = useRef<number>(0);
  const initialTrimStartRef = useRef<number>(0);
  const initialTrimEndRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
const dragHoverIndexRef = useRef<number | null>(null);


  // ───────────────────────────────── store (SAFE selectors)
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const clips = useEditorStore((s) => s.clips);
  const activeClipId = useEditorStore((s) => s.activeClipId);
  const selectClip = useEditorStore((s) => s.selectClip);
  const setTrimStart = useEditorStore((s) => s.setTrimStart);
  const setTrimEnd = useEditorStore((s) => s.setTrimEnd);
  const applyTrim = useEditorStore((s) => s.applyTrim);
  const currentTime = useEditorStore((s) => s.currentTime);
  const duration = useEditorStore((s) => s.duration);
  const setCurrentTime = useEditorStore((s) => s.setCurrentTime);
  const draggingClipId = useEditorStore((s) => s.draggingClipId);
  const setDraggingClip = useEditorStore((s) => s.setDraggingClip);
  const reorderClips = useEditorStore((s) => s.reorderClips);


  // ───────────────────────────────── helpers
  const seekFromMouse = (clientX: number) => {
    if (!timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const time = x / TIMELINE_SCALE;

    const clamped = clampTimeToSoftTrim(
  Math.max(0, Math.min(time, duration))
);

setCurrentTime(clamped);

  };

  const attachPlayheadWindowListeners = () => {
  const onMove = (e: MouseEvent) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / TIMELINE_SCALE;

    setCurrentTime(Math.max(0, Math.min(time, duration)));
  };

  const onUp = () => {
    isScrubbingRef.current = false;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
};

  // 🔒 Clamp time inside soft-trim window
const clampTimeToSoftTrim = (time: number) => {
  const clip = clips.find(
    (c) =>
      time >= c.startTime &&
      time <= c.startTime + c.duration
  );

  if (!clip) return time;

  const playStart = clip.startTime + clip.trimStart;
  const playEnd =
    clip.startTime + clip.duration - clip.trimEnd;

  if (time < playStart) return playStart;
  if (time > playEnd) return playEnd;

  return time;
};

  // ───────────────────────────────── window drag (TRIM)
  const attachTrimWindowListeners = () => {
    const onMove = (e: MouseEvent) => {
      if (!trimClipIdRef.current) return;

      const deltaSeconds =
        (e.clientX - trimStartXRef.current) / TIMELINE_SCALE;

      if (trimTypeRef.current === "start") {
        setTrimStart(
          trimClipIdRef.current,
          initialTrimStartRef.current + deltaSeconds
        );
      }

      if (trimTypeRef.current === "end") {
        setTrimEnd(
          trimClipIdRef.current,
          initialTrimEndRef.current - deltaSeconds
        );
      }
    };

    const onUp = () => {
      trimTypeRef.current = null;
      trimClipIdRef.current = null;
      setMode("idle");

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const attachClipDragWindowListeners = () => {
  const onMove = (e: MouseEvent) => {
    if (!timelineRef.current || !draggingClipId) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / TIMELINE_SCALE;

    const ordered = [...clips].sort(
      (a, b) => a.startTime - b.startTime
    );

    const index = ordered.findIndex(
      (c) => time < c.startTime + c.duration / 2
    );

    dragHoverIndexRef.current =
      index === -1 ? ordered.length - 1 : index;
  };

  const onUp = () => {
    if (draggingClipId && dragHoverIndexRef.current !== null) {
      const ordered = [...clips].sort(
        (a, b) => a.startTime - b.startTime
      );

      const from = ordered.findIndex(
        (c) => c.id === draggingClipId
      );
      const to = dragHoverIndexRef.current;

      if (from !== to) {
        reorderClips(from, to);
      }
    }

    dragHoverIndexRef.current = null;
    setDraggingClip(null);
    setMode("idle");

    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
};


  // ───────────────────────────────── timeline mouse
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScrubbingRef.current || mode === "trimming") return;
    seekFromMouse(e.clientX);
  };

  // ───────────────────────────────── render
 const safeTime = clampTimeToSoftTrim(currentTime);
const playheadLeft = safeTime * TIMELINE_SCALE;


  return (
    <div className="w-full bg-[#0f1629] border-t border-white/10 px-4 py-3">
      <div className="text-xs text-muted-foreground mb-2">
        Timeline
      </div>

     <div className="overflow-x-auto">
  <div
    ref={timelineRef}
    className="relative min-w-full"
    style={{ width: Math.max(duration * TIMELINE_SCALE, 800) }}
  >

        {/* ───── RULER (ONLY SEEK + PLAYHEAD) */}
<div
  className="relative h-8 bg-[#0a0f24]"
  onMouseDown={(e) => {
    seekFromMouse(e.clientX);
  }}
>
  {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
    <div
      key={i}
      className="absolute top-0 h-full border-l border-white/5"
      style={{ left: i * TIMELINE_SCALE }}
    />
  ))}

  {/* PLAYHEAD HANDLE */}
  <div
    onMouseDown={(e) => {
      e.stopPropagation();
      isScrubbingRef.current = true;
      attachPlayheadWindowListeners();
    }}
    className="absolute top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 cursor-ew-resize z-50"
    style={{ left: playheadLeft }}
  />

  {/* PLAYHEAD LINE */}
  <div
    className="absolute top-0 h-full w-[2px] bg-red-500 pointer-events-none"
    style={{ left: playheadLeft }}
  />
</div>


          {/* ───── clips */}
          <div className="relative h-12 bg-[#0a0f24]"></div>
          {clips.map((clip) => {
            const fullWidth = clip.duration * TIMELINE_SCALE;
            const left = clip.startTime * TIMELINE_SCALE;

            const trimStartWidth = clip.trimStart * TIMELINE_SCALE;
            const trimEndWidth = clip.trimEnd * TIMELINE_SCALE;

            const isActive = clip.id === activeClipId;

            return (
              <div
                key={clip.id}
               onMouseDown={(e) => {
  console.log("🟦 CLIP MOUSE DOWN", clip.id);

  if (mode !== "idle") {
    console.log("⛔ BLOCKED: mode =", mode);
    return;
  }

  if ((e.target as HTMLElement).closest(".trim-handle")) {
    console.log("⛔ BLOCKED: trim handle");
    return;
  }

  e.stopPropagation();
  console.log("✅ START CLIP DRAG", clip.id);

  setMode("dragging");
  setDraggingClip(clip.id);
  attachClipDragWindowListeners();
}}


                onClick={(e) => {
                  e.stopPropagation();

                  if (mode === "trimming" && activeClipId) {
                    applyTrim(activeClipId);
                  }

                  selectClip(clip.id);
                }}
                className={cn(
                  "absolute top-10 h-8 rounded-md overflow-hidden select-none",
                  isActive
                    ? "ring-2 ring-blue-300"
                    : "hover:ring-1 ring-white/20",
                    draggingClipId === clip.id && "opacity-60 z-40"
                )}
                style={{ left, width: fullWidth }}
              >
                {/* trimmed left */}
                <div
                  className="absolute left-0 top-0 h-full bg-black/40"
                  style={{ width: trimStartWidth }}
                />

                {/* active */}
                <div
                  className="absolute top-0 h-full bg-blue-500"
                  style={{
                    left: trimStartWidth,
                    width: fullWidth - trimStartWidth - trimEndWidth,
                  }}
                />

                {/* trimmed right */}
                <div
                  className="absolute right-0 top-0 h-full bg-black/40"
                  style={{ width: trimEndWidth }}
                />

                {/* LEFT HANDLE */}
                <div
                  className="trim-handle absolute left-0 top-0 h-full w-2 cursor-ew-resize z-20"

                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setMode("trimming");

                    trimTypeRef.current = "start";
                    trimClipIdRef.current = clip.id;
                    trimStartXRef.current = e.clientX;
                    initialTrimStartRef.current = clip.trimStart;
                    initialTrimEndRef.current = clip.trimEnd;

                    attachTrimWindowListeners();
                  }}
                />

                {/* RIGHT HANDLE */}
                <div
                 className="trim-handle absolute right-0 top-0 h-full w-2 cursor-ew-resize z-20"

                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setMode("trimming");

                    trimTypeRef.current = "end";
                    trimClipIdRef.current = clip.id;
                    trimStartXRef.current = e.clientX;
                    initialTrimStartRef.current = clip.trimStart;
                    initialTrimEndRef.current = clip.trimEnd;

                    attachTrimWindowListeners();
                  }}
                />

                <span className="absolute inset-0 flex items-center px-2 text-xs text-white pointer-events-none">
                  {clip.name}
                </span>
              </div>
            );
          })}
</div>
        
 




 



        </div>
      </div>
    
  );
}
