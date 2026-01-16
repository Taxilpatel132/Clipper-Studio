import { create } from "zustand";

export interface TimelineClip {
  id: string;
  name: string;
  src: string;

  startTime: number;   // position on timeline
  duration: number;    // full clip duration

  trimStart: number;   // seconds trimmed from start
  trimEnd: number;     // seconds trimmed from end
}


interface EditorState {
  projectId: string | null;
  projectName: string;
  draggingClipId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;

  clips: TimelineClip[];
  activeClipId: string | null;
  zoom: number;
  
  // New upload state
  pendingVideoSrc: string | null;

  // Enhanced drag state
  dragOffset: number;
  dropIndicatorPosition: number | null;

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
  
  // New upload methods
  uploadVideo: (file: File) => Promise<boolean>;
  clearPendingVideo: () => void;
  setTrimStart: (clipId: string, value: number) => void;
setTrimEnd: (clipId: string, value: number) => void;
mode: "idle" | "trimming" | "dragging";

setMode: (mode: "idle" | "trimming" | "dragging") => void;

applyTrim: (clipId: string) => void;

setDraggingClip: (id: string | null) => void;
reorderClips: (fromIndex: number, toIndex: number) => void;

  // Enhanced drag methods
  setDragOffset: (offset: number) => void;
  setDropIndicator: (position: number | null) => void;
  repositionClip: (clipId: string, newStartTime: number) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: "idle",
  draggingClipId: null,
  setMode: (mode) => set({ mode }),
  projectId: null,
  projectName: "Untitled Project",

  isPlaying: false,
  currentTime: 0,
  duration: 0,

  clips: [],
  activeClipId: null,
  zoom: 1,
  pendingVideoSrc: null,

  // Enhanced drag state
  dragOffset: 0,
  dropIndicatorPosition: null,

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
    clips: [
      ...state.clips,
      {
        ...clip,
       trimStart: 1,
       trimEnd: 1,
      },
    ],
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
      pendingVideoSrc: null,
    }),

  selectClip: (clipId) =>
    set({ activeClipId: clipId }),

  setZoom: (zoom) =>
    set({ zoom: Math.min(4, Math.max(0.25, zoom)) }),

  uploadVideo: async (file: File): Promise<boolean> => {
    if (!file.type.startsWith("video/")) {
      return false;
    }

    try {
      const url = URL.createObjectURL(file);
      set({ pendingVideoSrc: url });
      
      // Clear pending video after a short delay to allow components to process it
      setTimeout(() => {
        set({ pendingVideoSrc: null });
      }, 100);
      
      return true;
    } catch (error) {
      console.error("Failed to upload video:", error);
      return false;
    }
  },

  clearPendingVideo: () => set({ pendingVideoSrc: null }),
  setTrimStart: (clipId, value) =>
  set((state) => ({
    clips: state.clips.map((clip) =>
      clip.id === clipId
        ? {
            ...clip,
            trimStart: Math.max(
              0,
              Math.min(value, clip.duration - clip.trimEnd - 0.1)
            ),
          }
        : clip
    ),
  })),

setTrimEnd: (clipId, value) =>
  set((state) => ({
    clips: state.clips.map((clip) =>
      clip.id === clipId
        ? {
            ...clip,
            trimEnd: Math.max(
              0,
              Math.min(value, clip.duration - clip.trimStart - 0.1)
            ),
          }
        : clip
    ),
  })),
  applyTrim: (clipId) =>
  set((state) => ({
    clips: state.clips.map((clip) => {
      if (clip.id !== clipId) return clip;

      const newDuration =
        clip.duration - clip.trimStart - clip.trimEnd;

      return {
        ...clip,
        startTime: clip.startTime + clip.trimStart,
        duration: newDuration,
        trimStart: 0,
        trimEnd: 0,
      };
    }),
    mode: "idle",
  })),
  
  setDraggingClip: (id) => set({ draggingClipId: id }),

  setDragOffset: (offset) => set({ dragOffset: offset }),
  
  setDropIndicator: (position) => set({ dropIndicatorPosition: position }),
  
repositionClip: (clipId, newStartTime) =>
  set((state) => ({
    clips: state.clips.map((clip) =>
      clip.id === clipId
        ? { ...clip, startTime: newStartTime }
        : clip
    ),
  })),

  reorderClips: (from, to) =>
    set((state) => {
      const sortedClips = [...state.clips].sort((a, b) => a.startTime - b.startTime);
      const [movedClip] = sortedClips.splice(from, 1);
      sortedClips.splice(to, 0, movedClip);

      // Recalculate positions sequentially
      let currentTime = 0;
      const reorderedClips = sortedClips.map((clip) => {
        const newClip = { ...clip, startTime: currentTime };
        currentTime += clip.duration;
        return newClip;
      });

      return {
        clips: reorderedClips,
        activeClipId: movedClip.id,
        duration: currentTime
      };
    }),
    
}));
