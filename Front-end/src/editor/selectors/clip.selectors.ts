import { useMemo } from "react";
import { useEditorStore } from "@/editor/store/editor.store";

/**
 * Get the currently selected clip
 */
export function useActiveClip() {
  const clips = useEditorStore((state) => state.clips);
  const activeClipId = useEditorStore((state) => state.activeClipId);

  return useMemo(() => {
    if (!activeClipId) return null;
    return clips.find((c) => c.id === activeClipId) ?? null;
  }, [clips, activeClipId]);
}

/**
 * Get clips sorted by start time
 */
export function useSortedClips() {
  const clips = useEditorStore((state) => state.clips);

  return useMemo(
    () => [...clips].sort((a, b) => a.startTime - b.startTime),
    [clips]
  );
}

/**
 * Get number of clips
 */
export function useClipCount() {
  const clips = useEditorStore((state) => state.clips);
  return clips.length;
}

/**
 * Check if a specific clip is selected
 */
export function useIsClipSelected(clipId: string) {
  const activeClipId = useEditorStore((state) => state.activeClipId);
  return activeClipId === clipId;
}

/**
 * Check if any clip is selected
 */
export function useHasActiveClip() {
  const activeClipId = useEditorStore((state) => state.activeClipId);
  return activeClipId !== null;
}