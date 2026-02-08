import { useMemo } from "react";
import { useEditorStore } from "@/editor/store/editor.store";
import { buildTimelineWithGaps, getActiveSegment, getTotalDuration } from "@/editor/engine";

/**
 * Get timeline segments with gaps
 */
export function useTimelineSegments() {
  const clips = useEditorStore((state) => state.clips);

  return useMemo(() => buildTimelineWithGaps(clips), [clips]);
}

/**
 * Get active segment at current playhead position
 */
export function useActiveSegment() {
  const currentTime = useEditorStore((state) => state.currentTime);
  const segments = useTimelineSegments();

  return useMemo(
    () => getActiveSegment(segments, currentTime),
    [segments, currentTime]
  );
}

/**
 * Get total timeline duration (calculated from clips)
 */
export function useTotalDuration() {
  const clips = useEditorStore((state) => state.clips);

  return useMemo(() => getTotalDuration(clips), [clips]);
}

/**
 * Check if playhead is in a gap
 */
export function useIsInGap() {
  const segment = useActiveSegment();
  return segment?.type === "gap";
}

/**
 * Check if timeline is empty
 */
export function useIsTimelineEmpty() {
  const clips = useEditorStore((state) => state.clips);
  return clips.length === 0;
}

/**
 * Get current playback state
 */
export function usePlaybackState() {
  const isPlaying = useEditorStore((state) => state.isPlaying);
  const currentTime = useEditorStore((state) => state.currentTime);
  const duration = useEditorStore((state) => state.duration);

  return { isPlaying, currentTime, duration };
}