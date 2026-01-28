import { useEditor } from "@/hooks/useEditor";
import { useTotalDuration } from "@/editor/selectors";
import { clampTime } from "@/editor/engine";

/**
 * Hook for playback-related actions
 */
export function usePlaybackActions() {
  const {
    play,
    pause,
    togglePlay,        // ✅ This exists in your store
    isPlaying,
    currentTime,
    setCurrentTime,
  } = useEditor();

  const totalDuration = useTotalDuration();

  /**
   * Seek to a specific time
   */
  const seekTo = (time: number) => {
    const safeDuration = totalDuration > 0 ? totalDuration : 0;
    const clampedTime = clampTime(time, 0, safeDuration);
    setCurrentTime(clampedTime);
  };

  /**
   * Seek forward by seconds
   */
  const seekForward = (seconds = 5) => {
    seekTo(currentTime + seconds);
  };

  /**
   * Seek backward by seconds
   */
  const seekBackward = (seconds = 5) => {
    seekTo(currentTime - seconds);
  };

  /**
   * Go to start of timeline
   */
  const goToStart = () => {
    setCurrentTime(0);
  };

  /**
   * Go to end of timeline
   */
  const goToEnd = () => {
    setCurrentTime(totalDuration);
  };

  return {
    play,
    pause,
    togglePlay,
    seekTo,
    seekForward,
    seekBackward,
    goToStart,
    goToEnd,
    isPlaying,
    currentTime,
  };
}