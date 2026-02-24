import { TimelineClip } from "../types/clip.types";

export type ClipGroup = "video" | "overlay" | "audio";

/**
 * Groups clips by their group type and organizes them into tracks by trackIndex
 * @param clips - Array of timeline clips
 * @param group - The group type to filter by ("video", "overlay", or "audio")
 * @returns Array of tracks, where each track is an array of clips
 */
export const groupTracks = (clips: TimelineClip[], group: ClipGroup): TimelineClip[][] => {
  const tracks: { [key: number]: TimelineClip[] } = {};

  clips
    .filter((c) => c.group === group)
    .forEach((c) => {
      if (!tracks[c.trackIndex]) {
        tracks[c.trackIndex] = [];
      }
      tracks[c.trackIndex].push(c);
    });

  // Convert to array and sort by trackIndex
  return Object.keys(tracks)
    .map(Number)
    .sort((a, b) => a - b)
    .map((index) => tracks[index]);
};

/**
 * Gets all unique track indices for a given group type
 * @param clips - Array of timeline clips
 * @param group - The group type to filter by
 * @returns Sorted array of track indices
 */
export const getTrackIndices = (clips: TimelineClip[], group: ClipGroup): number[] => {
  const indices = new Set<number>();
  
  clips
    .filter((c) => c.group === group)
    .forEach((c) => indices.add(c.trackIndex));
  
  return Array.from(indices).sort((a, b) => a - b);
};

/**
 * Gets clips for a specific group and track index
 * @param clips - Array of timeline clips
 * @param group - The group type
 * @param trackIndex - The track index
 * @returns Array of clips matching the group and track index
 */
export const getClipsForTrack = (
  clips: TimelineClip[],
  group: ClipGroup,
  trackIndex: number
): TimelineClip[] => {
  return clips.filter((c) => c.group === group && c.trackIndex === trackIndex);
};
