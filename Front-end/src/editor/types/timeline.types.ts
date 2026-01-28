import { TimelineClip } from "./clip.types";

/**
 * A segment that contains a clip
 */
export interface ClipSegment {
  type: "clip";
  start: number;
  end: number;
  clip: TimelineClip;
}

/**
 * A gap between clips
 */
export interface GapSegment {
  type: "gap";
  start: number;
  end: number;
}

/**
 * Union type for timeline segments
 */
export type TimelineSegment = ClipSegment | GapSegment;