/**
 * Represents a video clip on the timeline
 * 
 * Example:
 * - A 10 second video starting at 5 seconds on timeline
 * - Trimmed 2 seconds from start, 1 second from end
 * - Effective playable duration = 10 - 2 - 1 = 7 seconds
 */
export interface TimelineClip {
  id: string;           // Unique identifier
  name: string;         // Display name (e.g., "Video 1")
  src: string;          // Video file URL
  startTime: number;    // Position on timeline (seconds)
  duration: number;     // Full clip duration (seconds)
  trimStart: number;    // Seconds trimmed from start
  trimEnd: number;      // Seconds trimmed from end
}
/**
 * Clip with calculated properties
 */
export interface ClipWithMeta extends TimelineClip {
  effectiveDuration: number;
  playStart: number;
  playEnd: number;
}