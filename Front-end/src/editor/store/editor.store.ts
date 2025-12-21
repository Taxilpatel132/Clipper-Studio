import { create } from "zustand";

/**
 * Core editor state
 * ❌ NO UI
 * ❌ NO DOM
 * ❌ NO API
 * ✅ Safe for SSR
 */

export interface TimelineClip {
  id: string;
  name: string;
  startTime: number; // seconds on timeline
  duration: number;  // seconds
}

interface EditorState {
  // -------- Project --------
  projectId: string | null;
  projectName: string;

  // -------- Playback --------
  isPlaying: boolean;
  currentTime: number;
  duration: number;

  // -------- Timeline --------
  clips: TimelineClip[];
  activeClipId: string | null;
  zoom: number;

  // -------- Actions --------
  setProject: (id: string, name: string) => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;

  addClip: (clip: TimelineClip) => void;
  clearClips: () => void;

  selectClip: (clipId: string | null) => void;
  setZoom: (zoom: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // -------- Initial State --------
  projectId: null,
  projectName: "Untitled Project",

  isPlaying: false,
  currentTime: 0,
  duration: 0,

  clips: [],
  activeClipId: null,
  zoom: 1,

  // -------- Project --------
  setProject: (id, name) =>
    set({
      projectId: id,
      projectName: name,
    }),

  // -------- Playback --------
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () =>
    set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentTime: (time) =>
    set({ currentTime: Math.max(0, time) }),

  setDuration: (duration) =>
    set({ duration: Math.max(0, duration) }),

  // -------- Timeline --------
  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
      activeClipId: clip.id, // auto-select new clip
    })),

  clearClips: () =>
    set({
      clips: [],
      activeClipId: null,
      currentTime: 0,
      isPlaying: false,
    }),

  selectClip: (clipId) =>
    set({ activeClipId: clipId }),

  setZoom: (zoom) =>
    set({
      zoom: Math.min(4, Math.max(0.25, zoom)),
    }),
}));
