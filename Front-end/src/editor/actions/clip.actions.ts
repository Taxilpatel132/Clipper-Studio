import { useEditorStore } from "@/editor/store/editor.store";
import { getTotalDuration } from "@/editor/engine";

/**
 * Hook for clip-related actions
 */
export function useClipActions() {
  const store = useEditorStore();

  // Destructure what exists in your store
  const {
    clips,
    activeClipId,
    addClip,
    selectClip,
    clearClips,
  } = store;

  // Safe access for optional methods (may or may not exist in store)
  const setTrimStart = typeof store.setTrimStart === "function" ? store.setTrimStart : null;
  const setTrimEnd = typeof store.setTrimEnd === "function" ? store.setTrimEnd : null;
  const applyTrim = typeof store.applyTrim === "function" ? store.applyTrim : null;
  const reorderClips = typeof store.reorderClips === "function" ? store.reorderClips : null;
  const repositionClip = typeof store.repositionClip === "function" ? store.repositionClip : null;

  /**
   * Duplicate a clip and add it to the end of timeline
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
   * Clear clip selection
   */
  const clearSelection = () => {
    selectClip(null);
  };

  /**
   * Get active clip object
   */
  const getActiveClip = () => {
    if (!activeClipId) return null;
    return clips.find((c) => c.id === activeClipId) ?? null;
  };

  return {
    // State
    clips,
    activeClipId,
    
    // Store methods
    addClip,
    selectClip,
    clearClips,
    setTrimStart,
    setTrimEnd,
    applyTrim,
    reorderClips,
    repositionClip,
    
    // Custom actions
    duplicateClip,
    clearSelection,
    getActiveClip,
  };
}