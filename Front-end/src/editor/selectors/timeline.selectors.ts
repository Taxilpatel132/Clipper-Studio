import { useMemo } from "react";
import { useEditor } from "@/hooks/useEditor";
import { buildTimelineWithGaps, getActiveSegment, getTotalDuration } from "@/editor/engine";

/**
 * Get timeline segments with gaps
 */
export function useTimelineSegments() {
  const { clips } = useEditor();

  return useMemo(() => buildTimelineWithGaps(clips), [clips]);
}

/**
 * Get active segment at current playhead position
 */
export function useActiveSegment() {
  const { currentTime } = useEditor();
  const segments = useTimelineSegments();

  return useMemo(
    () => getActiveSegment(segments, currentTime),
    [segments, currentTime]
  );
}

/**
 * Get total timeline duration
 */
export function useTotalDuration() {
  const { clips } = useEditor();

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
  const { clips } = useEditor();
  return clips.length === 0;
}