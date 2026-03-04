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


export function usePlaybackLayers() {
  const clips = useEditorStore((s) => s.clips);
  const currentTime = useEditorStore((s) => s.currentTime);

  const activeClips = clips.filter((clip) => {
    const start = clip.startTime + clip.trimStart;
    const end = clip.startTime + clip.duration - clip.trimEnd;
    return currentTime >= start && currentTime <= end;
  });

  let topVideo: any = null;
  const audioClips: any[] = [];
  const overlayClips: any[] = [];
  const backgroundClips: any[] = [];

  activeClips.forEach((clip) => {
    if (clip.group === "video") {
      if (!topVideo || clip.trackIndex > topVideo.trackIndex) {
        topVideo = clip;
      }
    }

    if (clip.group === "audio") {
      audioClips.push(clip);
    }

    if (clip.type === "background") {
      backgroundClips.push(clip);
    }

    if (clip.group === "overlay" && clip.type !== "background") {
      overlayClips.push(clip);
    }
  });

  return {
    video: topVideo,
    audio: audioClips,
    overlays: overlayClips,
    backgrounds: backgroundClips,
  };
}