"use client";

import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/editor/store/editor.store";

import type { TimelineClip } from "@/editor/store/editor.store";


const BASE_PX_PER_SECOND = 100;

const SNAP_THRESHOLD = 10; // pixels for snapping

export default function Timeline() {
  // Refs
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const isScrubbingRef = useRef(false);
  const trimTypeRef = useRef<"start" | "end" | null>(null);
  const trimClipIdRef = useRef<string | null>(null);
  const trimStartXRef = useRef<number>(0);
  const initialTrimStartRef = useRef<number>(0);
  const initialTrimEndRef = useRef<number>(0);
  const dragStartXRef = useRef<number>(0);
  const dragStartTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Store selectors
  const {
    mode,
    setMode,
    clips,
    activeClipId,
    selectClip,
    currentTime,
    duration,
    setCurrentTime,
    draggingClipId,
    setDraggingClip,
    dragOffset,
    setDragOffset,
    dropIndicatorPosition,
    setDropIndicator,
    setTrimStart,
    setTrimEnd,
    applyTrim,
    repositionClip,
    reorderClips,
    isPlaying,
    zoom,
     play, 
     pause
  } = useEditorStore();

   const pxPerSecond = BASE_PX_PER_SECOND * zoom;
  const TIMELINE_SCALE = pxPerSecond;
  // Helper functions
 const getTimeFromX = useCallback(
  (clientX: number) => {
    if (!timelineRef.current) return 0;

    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;

    const x = clientX - rect.left + scrollLeft;

    return Math.max(0, x / pxPerSecond);
  },
  [pxPerSecond]
);


  const clampTimeToSoftTrim = useCallback(
    (time: number) => {
      const clip = clips.find(
        (c) => time >= c.startTime && time <= c.startTime + c.duration
      );

      if (!clip) return time;

      const playStart = clip.startTime + clip.trimStart;
      const playEnd = clip.startTime + clip.duration - clip.trimEnd;

      return Math.max(playStart, Math.min(playEnd, time));
    },
    [clips]
  );

  const findSnapPosition = useCallback(
    (targetTime: number, excludeClipId?: string) => {
      const threshold = SNAP_THRESHOLD / TIMELINE_SCALE;
      const snapPoints = [0]; // Always snap to start

      // Add clip boundaries as snap points
      clips.forEach((clip) => {
        if (clip.id !== excludeClipId) {
          snapPoints.push(clip.startTime);
          snapPoints.push(clip.startTime + clip.duration);
        }
      });

      // Find closest snap point
      const closest = snapPoints.reduce(
        (prev, curr) =>
          Math.abs(curr - targetTime) < Math.abs(prev - targetTime)
            ? curr
            : prev
      );

      return Math.abs(closest - targetTime) <= threshold ? closest : targetTime;
    },
    [clips]
  );

  // Playhead dragging
  const handlePlayheadDrag = useCallback(() => {
    const onMove = (e: MouseEvent) => {
      const time = getTimeFromX(e.clientX);
      const clampedTime = clampTimeToSoftTrim(Math.min(time, duration));
      setCurrentTime(clampedTime);
    };

    const onUp = () => {
      isScrubbingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [duration, getTimeFromX, clampTimeToSoftTrim, setCurrentTime]);

  // Trim dragging
  const handleTrimDrag = useCallback(() => {
    const onMove = (e: MouseEvent) => {
      if (!trimClipIdRef.current) return;

      const deltaSeconds = (e.clientX - trimStartXRef.current) / TIMELINE_SCALE;

      if (trimTypeRef.current === "start") {
        setTrimStart(
          trimClipIdRef.current,
          initialTrimStartRef.current + deltaSeconds
        );
      } else if (trimTypeRef.current === "end") {
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
  }, [setTrimStart, setTrimEnd, setMode]);

  // Clip dragging with repositioning
  const handleClipDrag = useCallback(
    (clipId: string, startX: number) => {
      const clip = clips.find((c) => c.id === clipId);
      if (!clip) return;

      dragStartXRef.current = startX;
      dragStartTimeRef.current = clip.startTime;

      const onMove = (e: MouseEvent) => {
        const deltaX = e.clientX - dragStartXRef.current;
        const deltaTime = deltaX / TIMELINE_SCALE;
        const newTime = Math.max(0, dragStartTimeRef.current + deltaTime);
        const snappedTime = findSnapPosition(newTime, clipId);

        setDragOffset(deltaX);
        setDropIndicator(snappedTime);
      };

      const onUp = (e: MouseEvent) => {
      const finalDeltaX = e.clientX - dragStartXRef.current;
const finalDeltaTime = finalDeltaX / TIMELINE_SCALE;

const finalStartTime = Math.max(
  0,
  dragStartTimeRef.current + finalDeltaTime
);

repositionClip(clipId, finalStartTime);


        setDragOffset(0);
        setDropIndicator(null);
        setDraggingClip(null);
        setMode("idle");

        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [
      clips,
      findSnapPosition,
      setDragOffset,
      setDropIndicator,
      repositionClip,
      setDraggingClip,
      setMode,
      dropIndicatorPosition,
    ]
  );

  // Event handlers
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (isScrubbingRef.current || mode !== "idle") return;
    const time = getTimeFromX(e.clientX);
    setCurrentTime(Math.min(time, duration));
  };

  const handleClipMouseDown = (e: React.MouseEvent, clipId: string) => {
    if (mode !== "idle") return;
    if ((e.target as HTMLElement).closest(".trim-handle")) return;

    e.stopPropagation();
    setMode("dragging");
    setDraggingClip(clipId);
    selectClip(clipId);
    handleClipDrag(clipId, e.clientX);
  };

  const handleTrimMouseDown = (
    e: React.MouseEvent,
    clipId: string,
    type: "start" | "end",
    clip: any
  ) => {
    e.stopPropagation();
    setMode("trimming");
    selectClip(clipId);

    trimTypeRef.current = type;
    trimClipIdRef.current = clipId;
    trimStartXRef.current = e.clientX;
    initialTrimStartRef.current = clip.trimStart;
    initialTrimEndRef.current = clip.trimEnd;

    handleTrimDrag();
  };

const getClipAtTime = useCallback(
  (time: number) => {
    return clips.find((clip) => {
      const playStart = clip.startTime + clip.trimStart;
      const playEnd =
        clip.startTime + clip.duration - clip.trimEnd;

      return time > playStart && time < playEnd;
    });
  },
  [clips]
);
const splitClipAtCurrentTime = useCallback(() => {
  const clip = getClipAtTime(currentTime);
  if (!clip) return; // gap or invalid split

const playStart = clip.startTime + clip.trimStart;
const playEnd = clip.startTime + clip.duration - clip.trimEnd;

if (currentTime <= playStart || currentTime >= playEnd) return;

const splitAtVideoTime = currentTime - playStart;
const splitOffset = splitAtVideoTime;

  // Safety guards
  if (splitOffset <= 0 || splitOffset >= clip.duration) {
    return;
  }

  const firstClip: TimelineClip = {
  ...clip,
  id: crypto.randomUUID(),
  duration: splitAtVideoTime,
  trimStart: clip.trimStart,
  trimEnd: 0,
};

const secondClip: TimelineClip = {
  ...clip,
  id: crypto.randomUUID(),
  startTime: clip.startTime + splitAtVideoTime,
  duration: clip.duration - splitAtVideoTime,
  trimStart: 0,
  trimEnd: clip.trimEnd,
};


useEditorStore.setState((state) => {
  const clips = state.clips
    .flatMap((c) =>
      c.id === clip.id ? [firstClip, secondClip] : [c]
    )
    .sort((a, b) => a.startTime - b.startTime);

  const duration = Math.max(
    0,
    ...clips.map((c) => c.startTime + c.duration)
  );

  return {
    clips,
    duration,
    activeClipId: secondClip.id,
  };
});


}, [clips, currentTime, getClipAtTime]);


 const goToNextClip = useCallback(() => {
  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);

  const next = sorted.find(
    (clip) => clip.startTime > currentTime
  );

  if (next) {
    setCurrentTime(next.startTime);
  } else {
    // Optional: jump to end
    setCurrentTime(duration);
  }
}, [clips, currentTime, setCurrentTime, duration]);

const goToPreviousClip = useCallback(() => {
  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);

  const prev = [...sorted]
    .reverse()
    .find((clip) => clip.startTime < currentTime);

  if (prev) {
    setCurrentTime(prev.startTime);
  } else {
    // Optional: jump to start
    setCurrentTime(0);
  }
}, [clips, currentTime, setCurrentTime]);

  // Render helpers
  const renderTimelineRuler = () => {
    const safeTime = isPlaying
  ? currentTime
  : clampTimeToSoftTrim(currentTime);

    const playheadLeft = safeTime * TIMELINE_SCALE;

    return (
      <div
        className="relative h-8 bg-[#0a0f24] border-b border-white/10"
        onClick={handleTimelineClick}
      >
        
        {/* Ruler marks */}
        {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full border-l border-white/20"
            style={{ left: i * TIMELINE_SCALE }}
          >
            <span className="absolute top-1 left-1 text-xs text-white/60">
              {i}s
            </span>
          </div>
        ))}

        {/* Drop indicator */}
        {dropIndicatorPosition !== null && (
          <div
            className="absolute top-0 h-full w-0.5 bg-yellow-400 z-30"
            style={{ left: dropIndicatorPosition * TIMELINE_SCALE }}
          />
        )}
        <div className="flex gap-2 px-4 py-2">
  <button
    onClick={() => useEditorStore.getState().setZoom(zoom - 0.25)}
    className="px-2 py-1 bg-gray-700 text-white text-xs rounded"
  >
    −
  </button>

  <span className="text-xs text-white/70">
    Zoom: {zoom.toFixed(2)}x
  </span>

  <button
    onClick={() => useEditorStore.getState().setZoom(zoom + 0.25)}
    className="px-2 py-1 bg-gray-700 text-white text-xs rounded"
  >
    +
  </button>
</div>


        {/* Playhead */}
        <div
          className="absolute top-0 h-full w-0.5 bg-red-500 z-40"
          style={{ left: playheadLeft }}
        />
        <div
          className="absolute top-1 h-4 w-4 -translate-x-1/2 rounded-full bg-red-500 cursor-ew-resize z-50 hover:scale-110 transition-transform"
          style={{ left: playheadLeft }}
          onMouseDown={(e) => {
            e.stopPropagation();
            isScrubbingRef.current = true;
            handlePlayheadDrag();
          }}
        />
      </div>
    );
  };

  const renderClip = (clip: any) => {
    const fullWidth = clip.duration * TIMELINE_SCALE;
    const left = clip.startTime * TIMELINE_SCALE;
    const trimStartWidth = clip.trimStart * TIMELINE_SCALE;
    const trimEndWidth = clip.trimEnd * TIMELINE_SCALE;
    const isActive = clip.id === activeClipId;
    const isDragging = draggingClipId === clip.id;

    return (
      <div
        key={clip.id}
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
        onMouseDown={(e) => handleClipMouseDown(e, clip.id)}
        onClick={(e) => {
          e.stopPropagation();
          if (mode === "trimming" && activeClipId) {
            applyTrim(activeClipId);
          }
          selectClip(clip.id);
        }}
      >
        {/* Trimmed sections */}
        <div
          className="absolute left-0 top-0 h-full bg-black/50 border-r border-white/20"
          style={{ width: trimStartWidth }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-black/50 border-l border-white/20"
          style={{ width: trimEndWidth }}
        />

        {/* Active section */}
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500"
          style={{
            left: trimStartWidth,
            width: fullWidth - trimStartWidth - trimEndWidth,
          }}
        />

        {/* Trim handles */}
        <div
          className="trim-handle absolute left-0 top-0 h-full w-3 cursor-ew-resize bg-yellow-500/20 hover:bg-yellow-500/40 z-20"
          onMouseDown={(e) => handleTrimMouseDown(e, clip.id, "start", clip)}
        />
        <div
          className="trim-handle absolute right-0 top-0 h-full w-3 cursor-ew-resize bg-yellow-500/20 hover:bg-yellow-500/40 z-20"
          onMouseDown={(e) => handleTrimMouseDown(e, clip.id, "end", clip)}
        />

        {/* Clip label */}
        <div className="absolute inset-0 flex items-center px-3 text-xs text-white font-medium truncate pointer-events-none">
          {clip.name}
        </div>
      </div>
    );
  };
  const startPlayback = useCallback(() => {
  lastTimeRef.current = performance.now();

  const tick = (now: number) => {
    const delta = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

   setCurrentTime((t) => {
  const next = t + delta;
  if (next >= duration) {
    stopPlayback();
    return duration;
  }
  return next;
});

    rafRef.current = requestAnimationFrame(tick);
  };

  rafRef.current = requestAnimationFrame(tick);
}, [setCurrentTime, duration]);

const stopPlayback = useCallback(() => {
  if (rafRef.current) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
}, []);
useEffect(() => {
  if (isPlaying) {
    startPlayback();
  } else {
    stopPlayback();
  }

  return stopPlayback;
}, [isPlaying, startPlayback, stopPlayback]);

  
  const timelineWidth = Math.max(duration * TIMELINE_SCALE + 200, 1000);

  return (
    <div className="w-full  bg-[#0f1629] border-t border-white/10">
      <div className="px-4 py-2 border-b border-white/10">
       <div className="flex items-center gap-2 justify-center">
  <button
    onClick={goToPreviousClip}
    className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
  >
    ⏮ Prev
  </button>

  <button
    onClick={() => (isPlaying ? pause() : play())}
    className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
  >
    {isPlaying ? "Pause" : "Play"}
  </button>
   <button
  onClick={splitClipAtCurrentTime}
  className="px-3 py-1 bg-yellow-600 text-black text-xs rounded"
>
  ✂ Split
</button>

  <button
    onClick={goToNextClip}
    className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
  >
    Next ⏭
  </button>

  <button
    onClick={() => setCurrentTime(0)}
    className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
  >
    ⏮ Start
  </button>
</div>

      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        <div
          ref={timelineRef}
          className="relative"
          style={{ width: timelineWidth, height: 80 }}
        >
          {renderTimelineRuler()}

          {/* Clips container */}
          <div className="relative h-12 bg-[#0a0f24] border-b border-white/10">
            {clips.map(renderClip)}
          </div>
        </div>
      </div>
    </div>
  );
}
