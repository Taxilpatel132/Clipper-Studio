import { useMemo } from "react";
import { useEditor } from "@/hooks/useEditor";

/**
 * Get the currently active/selected clip
 */
export function useActiveClip() {
  const { clips, activeClipId } = useEditor();

  return useMemo(() => {
    if (!activeClipId) return null;
    return clips.find((c) => c.id === activeClipId) ?? null;
  }, [clips, activeClipId]);
}

/**
 * Get sorted clips by start time
 */
export function useSortedClips() {
  const { clips } = useEditor();

  return useMemo(
    () => [...clips].sort((a, b) => a.startTime - b.startTime),
    [clips]
  );
}

/**
 * Get clip count
 */
export function useClipCount() {
  const { clips } = useEditor();
  return clips.length;
}

/**
 * Check if a specific clip is selected
 */
export function useIsClipSelected(clipId: string) {
  const { activeClipId } = useEditor();
  return activeClipId === clipId;
}