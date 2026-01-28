import { useEditor } from "@/hooks/useEditor";
import { getTotalDuration } from "@/editor/engine";

/**
 * Hook for clip-related actions
 */
export function useClipActions() {
  const {
    addClip,
    selectClip,        // ✅ This exists in your store
    clips,
    setTrimStart,
    setTrimEnd,
    applyTrim,
    reorderClips,
    repositionClip,
    clearClips,
  } = useEditor();

  /**
   * Duplicate a clip and add it to the end
   */
  const duplicateClip = (clipId: string) => {
    const clip = clips.find((c) => c.id === clipId);
    if (!clip) return;

    const lastEnd = getTotalDuration(clips);

    addClip({
      id: crypto.randomUUID(),
      name: `${clip.name} (copy)`,
      src: clip.src,
      startTime: lastEnd,
      duration: clip.duration,
      trimStart: clip.trimStart,
      trimEnd: clip.trimEnd,
    });
  };

  /**
   * Clear selection
   */
  const clearSelection = () => {
    selectClip(null);
  };

  return {
    // From store
    addClip,
    selectClip,
    setTrimStart,
    setTrimEnd,
    applyTrim,
    reorderClips,
    repositionClip,
    clearClips,
    
    // Custom actions
    duplicateClip,
    clearSelection,
  };
}