import { TimelineClip } from "@/editor/types";

/**
 * Calculate effective duration after trimming
 * 
 * Example: 10s video, trimStart=2s, trimEnd=1s
 * Result: 10 - 2 - 1 = 7 seconds
 */
export function getEffectiveDuration(clip: TimelineClip): number {
  return clip.duration - clip.trimStart - clip.trimEnd;
}

/**
 * Get playable time range for a clip on timeline
 * 
 * Example: clip at startTime=5s, duration=10s, trimStart=2s, trimEnd=1s
 * Result: { start: 7, end: 14 }
 */
export function getClipPlayRange(clip: TimelineClip) {
  const start = clip.startTime + clip.trimStart;
  const end = clip.startTime + clip.duration - clip.trimEnd;
  return { start, end };
}

/**
 * Check if a time falls within a clip's playable range
 */
export function isTimeInClip(clip: TimelineClip, time: number): boolean {
  const { start, end } = getClipPlayRange(clip);
  return time >= start && time < end;
}

/**
 * Convert global timeline time to clip-local time
 * 
 * Example: globalTime=10s, clip starts at 5s with 2s trimStart
 * Playable start = 7s
 * Result: 10 - 7 = 3s (3 seconds into the playable portion)
 */
export function globalToClipTime(clip: TimelineClip, globalTime: number): number {
  const { start } = getClipPlayRange(clip);
  return globalTime - start;
}

/**
 * Convert clip-local time to global timeline time
 */
export function clipToGlobalTime(clip: TimelineClip, clipTime: number): number {
  const { start } = getClipPlayRange(clip);
  return start + clipTime;
}