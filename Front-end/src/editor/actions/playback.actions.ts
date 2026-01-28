import { useEditorStore } from "@/editor/store/editor.store";
import { clampTime } from "@/editor/engine";

/**
 * Hook for playback-related actions
 */
export function usePlaybackActions() {
  const store = useEditorStore();

  const {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlay,
    setCurrentTime,
  } = store;

  /**
   * Seek to a specific time (with bounds checking)
   */
  const seekTo = (time: number) => {
    const safeDuration = duration > 0 ? duration : 0;
    const clampedTime = clampTime(time, 0, safeDuration);
    setCurrentTime(clampedTime);
  };

  /**
   * Skip forward by X seconds (default 5)
   */
  const seekForward = (seconds = 5) => {
    seekTo(currentTime + seconds);
  };

  /**
   * Skip backward by X seconds (default 5)
   */
  const seekBackward = (seconds = 5) => {
    seekTo(currentTime - seconds);
  };

  /**
   * Jump to start of timeline
   */
  const goToStart = () => {
    setCurrentTime(0);
  };

  /**
   * Jump to end of timeline
   */
  const goToEnd = () => {
    setCurrentTime(duration);
  };

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    
    // Store methods
    play,
    pause,
    togglePlay,
    setCurrentTime,
    
    // Custom actions
    seekTo,
    seekForward,
    seekBackward,
    goToStart,
    goToEnd,
  };
}