/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00";
  }

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format time with milliseconds (e.g., 1:23.45)
 */
export function formatTimeWithMs(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return "0:00.00";
  }

  const base = formatTime(seconds);
  const ms = Math.floor((seconds % 1) * 100);
  return `${base}.${ms.toString().padStart(2, "0")}`;
}

/**
 * Clamp time within bounds
 */
export function clampTime(time: number, min: number, max: number): number {
  return Math.max(min, Math.min(time, max));
}