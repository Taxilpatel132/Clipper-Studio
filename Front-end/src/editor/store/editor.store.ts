import { create } from "zustand";

export interface TimelineClip {
  id: string;
  name: string;
  src: string;          // ✅ FIX 1
  startTime: number;
  duration: number;
}

interface EditorState {
  projectId: string | null;
  projectName: string;

  isPlaying: boolean;
  currentTime: number;
  duration: number;

  clips: TimelineClip[];
  activeClipId: string | null;
  zoom: number;

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
  projectId: null,
  projectName: "Untitled Project",

  isPlaying: false,
  currentTime: 0,
  duration: 0,

  clips: [],
  activeClipId: null,
  zoom: 1,

  setProject: (id, name) =>
    set({ projectId: id, projectName: name }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () =>
    set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentTime: (time) =>
    set({ currentTime: Math.max(0, time) }),

  setDuration: (duration) =>
    set({ duration: Math.max(0, duration) }),

  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
      activeClipId: clip.id,
      duration: Math.max(
        state.duration,
        clip.startTime + clip.duration
      ),
    })),

  clearClips: () =>
    set({
      clips: [],
      activeClipId: null,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    }),

  selectClip: (clipId) =>
    set({ activeClipId: clipId }),

  setZoom: (zoom) =>
    set({ zoom: Math.min(4, Math.max(0.25, zoom)) }),
}));
