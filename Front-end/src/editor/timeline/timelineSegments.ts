import { TimelineClip } from "@/editor/store/editor.store";

export type TimelineSegment =
  | {
      type: "clip";
      start: number;
      end: number;
      clip: TimelineClip;
    }
  | {
      type: "gap";
      start: number;
      end: number;
    };

export function buildTimelineWithGaps(
  clips: TimelineClip[]
): TimelineSegment[] {
  if (clips.length === 0) return [];

  const sorted = [...clips].sort(
    (a, b) => a.startTime - b.startTime
  );

  const segments: TimelineSegment[] = [];
  let cursor = 0;

  for (const clip of sorted) {
    const clipStart = clip.startTime + clip.trimStart;
    const clipEnd =
      clip.startTime + clip.duration - clip.trimEnd;

    // 👉 GAP before clip
    if (clipStart > cursor) {
      segments.push({
        type: "gap",
        start: cursor,
        end: clipStart,
      });
    }

    // 👉 CLIP segment
    segments.push({
      type: "clip",
      start: clipStart,
      end: clipEnd,
      clip,
    });

    cursor = clipEnd;
  }

  return segments;
}

export function getActiveSegment(
  segments: TimelineSegment[],
  time: number
): TimelineSegment | null {
  return (
    segments.find(
      (s) => time >= s.start && time < s.end
    ) ?? null
  );
}
