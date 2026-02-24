"use client";

import { useRef, useCallback, useEffect, useMemo } from "react";
import { useEditorStore } from "@/editor/store/editor.store";
import type { TimelineClip } from "@/editor/types";
import { getTrackIndices, ClipGroup } from "@/editor/utils/timeline.utils";

const BASE_PX_PER_SECOND = 100;
const SNAP_THRESHOLD = 10;

export function useTimelineControls() {
  // ═══════════════════════════════════════════
  // Refs
  // ═══════════════════════════════════════════
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
  
  const TRACK_HEIGHT = 48; // same as h-12
  const HEADER_HEIGHT = 28; // group header height

  // ═══════════════════════════════════════════
  // Store
  // ═══════════════════════════════════════════
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
    isPlaying,
    zoom,
    play,
    pause,
    trackCounts,
  } = useEditorStore();

  const pxPerSecond = BASE_PX_PER_SECOND * zoom;
  const TIMELINE_SCALE = pxPerSecond;
  const timelineWidth = Math.max(duration * TIMELINE_SCALE + 200, 1000);

  // ═══════════════════════════════════════════
  // Helper Functions
  // ═══════════════════════════════════════════
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
      const snapPoints = [0];

      clips.forEach((clip) => {
        if (clip.id !== excludeClipId) {
          snapPoints.push(clip.startTime);
          snapPoints.push(clip.startTime + clip.duration);
        }
      });

      const closest = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - targetTime) < Math.abs(prev - targetTime) ? curr : prev
      );

      return Math.abs(closest - targetTime) <= threshold ? closest : targetTime;
    },
    [clips, TIMELINE_SCALE]
  );

  const getClipAtTime = useCallback(
    (time: number) => {
      return clips.find((clip) => {
        const playStart = clip.startTime + clip.trimStart;
        const playEnd = clip.startTime + clip.duration - clip.trimEnd;
        return time > playStart && time < playEnd;
      });
    },
    [clips]
  );

  // Build dynamic track map for Y-coordinate detection
  const trackMap = useMemo(() => {
    const groups: Array<{ group: ClipGroup; trackCount: number }> = [
      { group: "video", trackCount: trackCounts.video },
      { group: "overlay", trackCount: trackCounts.overlay },
      { group: "audio", trackCount: trackCounts.audio },
    ];

    let yOffset = 0;
    const map: Array<{ yStart: number; yEnd: number; group: ClipGroup; trackIndex: number }> = [];

    groups.forEach(({ group, trackCount }) => {
      // Skip header
      yOffset += HEADER_HEIGHT;
      
      // Create map entries for all tracks (even empty ones)
      for (let i = 0; i < trackCount; i++) {
        map.push({
          yStart: yOffset,
          yEnd: yOffset + TRACK_HEIGHT,
          group,
          trackIndex: i,
        });
        yOffset += TRACK_HEIGHT;
      }
    });

    return map;
  }, [trackCounts]);

  //helper function to determine track based on Y coordinate
  const getTrackFromY = useCallback((clientY: number): { group: ClipGroup; trackIndex: number } | null => {
    if (!timelineRef.current) return null;

    const rect = timelineRef.current.getBoundingClientRect();
    const y = clientY - rect.top;

    const track = trackMap.find((t) => y >= t.yStart && y < t.yEnd);
    return track ? { group: track.group, trackIndex: track.trackIndex } : null;
  }, [trackMap]);
  // ═══════════════════════════════════════════
  // Playhead Dragging
  // ═══════════════════════════════════════════
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

  const startPlayheadDrag = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      isScrubbingRef.current = true;
      handlePlayheadDrag();
    },
    [handlePlayheadDrag]
  );

  // ═══════════════════════════════════════════
  // Trim Dragging
  // ═══════════════════════════════════════════
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
  }, [setTrimStart, setTrimEnd, setMode, TIMELINE_SCALE]);

  const handleTrimMouseDown = useCallback(
    (
      e: React.MouseEvent,
      clipId: string,
      type: "start" | "end",
      clip: TimelineClip
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
    },
    [setMode, selectClip, handleTrimDrag]
  );

  // ═══════════════════════════════════════════
  // Clip Dragging
  // ═══════════════════════════════════════════
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

  const newTrack = getTrackFromY(e.clientY);

  setDragOffset(deltaX);
  setDropIndicator(snappedTime);

  // ✅ Only allow dragging within the same group
  if (newTrack && newTrack.group === clip.group && newTrack.trackIndex !== clip.trackIndex) {
    useEditorStore.setState((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId ? { ...c, trackIndex: newTrack.trackIndex } : c
      ),
    }));
  }
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
      TIMELINE_SCALE,
    ]
  );

  const handleClipMouseDown = useCallback(
    (e: React.MouseEvent, clipId: string) => {
      if (mode !== "idle") return;
      if ((e.target as HTMLElement).closest(".trim-handle")) return;

      e.stopPropagation();
      setMode("dragging");
      setDraggingClip(clipId);
      selectClip(clipId);
      handleClipDrag(clipId, e.clientX);
    },
    [mode, setMode, setDraggingClip, selectClip, handleClipDrag]
  );

  const handleClipClick = useCallback(
    (e: React.MouseEvent, clipId: string) => {
      e.stopPropagation();
      if (mode === "trimming" && activeClipId) {
        applyTrim(activeClipId);
      }
      selectClip(clipId);
    },
    [mode, activeClipId, applyTrim, selectClip]
  );

  // ═══════════════════════════════════════════
  // Timeline Click
  // ═══════════════════════════════════════════
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (isScrubbingRef.current || mode !== "idle") return;
      const time = getTimeFromX(e.clientX);
      setCurrentTime(Math.min(time, duration));
    },
    [mode, getTimeFromX, duration, setCurrentTime]
  );

  // ═══════════════════════════════════════════
  // Navigation
  // ═══════════════════════════════════════════
  const goToNextClip = useCallback(() => {
    const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
    const next = sorted.find((clip) => clip.startTime > currentTime);
    setCurrentTime(next ? next.startTime : duration);
  }, [clips, currentTime, setCurrentTime, duration]);

  const goToPreviousClip = useCallback(() => {
    const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
    const prev = [...sorted]
      .reverse()
      .find((clip) => clip.startTime < currentTime);
    setCurrentTime(prev ? prev.startTime : 0);
  }, [clips, currentTime, setCurrentTime]);

  const goToStart = useCallback(() => {
    setCurrentTime(0);
  }, [setCurrentTime]);

  // ═══════════════════════════════════════════
  // Split
  // ═══════════════════════════════════════════
  const splitClipAtCurrentTime = useCallback(() => {
    const clip = getClipAtTime(currentTime);
    if (!clip) return;

    const playStart = clip.startTime + clip.trimStart;
    const playEnd = clip.startTime + clip.duration - clip.trimEnd;
    if (currentTime <= playStart || currentTime >= playEnd) return;

    const splitAtVideoTime = currentTime - playStart;
    if (splitAtVideoTime <= 0 || splitAtVideoTime >= clip.duration) return;

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
      const newClips = state.clips
        .flatMap((c) => (c.id === clip.id ? [firstClip, secondClip] : [c]))
        .sort((a, b) => a.startTime - b.startTime);

      return {
        clips: newClips,
        duration: Math.max(0, ...newClips.map((c) => c.startTime + c.duration)),
        activeClipId: secondClip.id,
      };
    });
  }, [currentTime, getClipAtTime]);

  // ═══════════════════════════════════════════
  // Playback Loop
  // ═══════════════════════════════════════════
  const stopPlayback = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((t: number) => {
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
  }, [setCurrentTime, duration, stopPlayback]);

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    } else {
      stopPlayback();
    }
    return stopPlayback;
  }, [isPlaying, startPlayback, stopPlayback]);

  // ═══════════════════════════════════════════
  // Return
  // ═══════════════════════════════════════════
  return {
    // Refs
    timelineRef,

    // State
    mode,
    clips,
    activeClipId,
    currentTime,
    duration,
    draggingClipId,
    dragOffset,
    dropIndicatorPosition,
    isPlaying,
    zoom,
    TIMELINE_SCALE,
    timelineWidth,

    // Actions
    play,
    pause,

    // Handlers
    handleTimelineClick,
    handleClipMouseDown,
    handleClipClick,
    handleTrimMouseDown,
    startPlayheadDrag,
    clampTimeToSoftTrim,

    // Navigation
    goToNextClip,
    goToPreviousClip,
    goToStart,
    splitClipAtCurrentTime,
  };
}