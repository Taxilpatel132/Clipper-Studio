import { TimelineClip, TimelineSegment } from "@/editor/types";
import { getClipPlayRange } from "./clip";

/**
 * Build timeline segments including gaps between clips
 */
export function buildTimelineWithGaps(clips: TimelineClip[]): TimelineSegment[] {
  if (clips.length === 0) return [];

  // Sort clips by start time
  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
  const segments: TimelineSegment[] = [];

  let currentTime = 0;

  for (const clip of sorted) {
    const { start, end } = getClipPlayRange(clip);

    // Add gap if there's space before this clip
    if (start > currentTime) {
      segments.push({
        type: "gap",
        start: currentTime,
        end: start,
      });
    }

    // Add the clip segment
    segments.push({
      type: "clip",
      start,
      end,
      clip,
    });

    currentTime = end;
  }

  return segments;
}

/**
 * Get the active segment at a given time
 */
export function getActiveSegment(
  segments: TimelineSegment[],
  time: number
): TimelineSegment | null {
  for (const segment of segments) {
    if (time >= segment.start && time < segment.end) {
      return segment;
    }
  }
  return null;
}

/**
 * Calculate total timeline duration
 */
export function getTotalDuration(clips: TimelineClip[]): number {
  if (clips.length === 0) return 0;

  return Math.max(
    ...clips.map((clip) => {
      const { end } = getClipPlayRange(clip);
      return end;
    })
  );
}