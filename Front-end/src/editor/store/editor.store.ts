import { create } from "zustand";
import {EditorSnapshot} from '../types/clip.types'
export interface TimelineClip {
  id: string;
  name: string;
  src: string;

  startTime: number;   // position on timeline
  duration: number;    // full clip duration
 trackId: string;     // 🔥 NEW - which track this clip belongs to
  trimStart: number;   
  trimEnd: number;     
    type: "video" | "audio" | "image"; 
     previewSessionId?: string;
  framesBaseUrl?: string;
  fps?: number;

}
const createSnapshot = (state: EditorState): EditorSnapshot => ({
  clips: JSON.parse(JSON.stringify(state.clips)),
  currentTime: state.currentTime,
  duration: state.duration,
  zoom: state.zoom,
  activeClipId: state.activeClipId,
});

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
  history: {
  past: EditorSnapshot[]
  
  future: EditorSnapshot[]
}

pushToHistory: () => void
undo: () => void
redo: () => void
  setProject: (id: string, name: string) => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;

  setCurrentTime: (time: number | ((t: number) => number)) => void;
  setDuration: (duration: number) => void;

  addClip: (clip: TimelineClip) => void;
  clearClips: () => void;
  
  selectClip: (clipId: string | null) => void;
  setZoom: (zoom: number) => void;
  
  // New upload methods
  getVideoDuration: (src: string) => Promise<number>;
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
  history: {
  past: [],
  
  future: [],
},

  setProject: (id, name) =>
    set({ projectId: id, projectName: name }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () =>
    set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentTime: (time) =>
  set((state) => ({
    currentTime:
      typeof time === "function"
        ? time(state.currentTime)
        : time,
  })),



  setDuration: (duration) =>
    set({ duration: Math.max(0, duration) }),

  addClip: (clip) => {
  get().pushToHistory();

  set((state) => {
    const updatedClips = [
      ...state.clips,
      { ...clip, trimStart: 0, trimEnd: 0 },
    ];

    const updatedDuration = Math.max(
      state.duration,
      clip.startTime + clip.duration
    );

    return {
      clips: updatedClips,
      activeClipId: clip.id,
      duration: updatedDuration,
    };
  });
},


 clearClips: () => {
  const state = get();
  state.pushToHistory();

  get().clips.forEach((c) => {
    if (c.src.startsWith("blob:")) {
      URL.revokeObjectURL(c.src);
    }
  });

  set({
    clips: [],
    activeClipId: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
  });
},

  selectClip: (clipId) =>
    set({ activeClipId: clipId }),

  setZoom: (zoom) =>
    set({ zoom: Math.min(4, Math.max(0.25, zoom)) }),
  getVideoDuration: (src: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = src;

    video.onloadedmetadata = () => {
      resolve(video.duration);
      //URL.revokeObjectURL(video.src); // cleanup
    };

    video.onerror = () => reject(new Error("Failed to load video metadata"));
  });
},
 uploadVideo: async (file: File): Promise<boolean> => {
  if (!file.type.startsWith("video/")) return false;

  try {
    // 1️⃣ Upload to backend for preview frames
    const form = new FormData();
    form.append("video", file);
    form.append("fps", "2");

    const res = await fetch(
      "http://localhost:5000/api/render/upload-preview",
      {
        method: "POST",
        body: form,
      }
    );

    if (!res.ok) throw new Error("Preview upload failed");

    const data = await res.json();
    // data = { previewSessionId, baseUrl, fps }
   console.log("BACKEND baseUrl:", data.baseUrl);
    // 2️⃣ Create local blob URL for playback
    const videoUrl = URL.createObjectURL(file);

    // 3️⃣ Create clip with TEMP duration (0 for now)
    const clipId = crypto.randomUUID();

   const clip: TimelineClip = {
  id: clipId,
  name: file.name,
  src: videoUrl,
  startTime: 0,
  duration: 0,
  trimStart: 0,
  trimEnd: 0,
  type: "video",
  trackId: "video-2", // 🔥 assign to a track
  framesBaseUrl: data.baseUrl, // ✅ already full URL
  fps: data.fps,
};
    // 4️⃣ Add clip immediately (UI responds instantly)
    set((state) => ({
      clips: [...state.clips, clip],
      activeClipId: clipId,
    }));

    // 5️⃣ 🔥 NOW load real video duration
    const duration = await get().getVideoDuration(videoUrl);

    // 6️⃣ Update clip + timeline duration
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === clipId ? { ...c, duration } : c
      ),
      duration: Math.max(state.duration, duration),
    }));

    return true;
  } catch (err) {
    console.error("Upload preview failed:", err);
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
  applyTrim: (clipId) => {
  const state = get();
  state.pushToHistory();

  set((s) => ({
    clips: s.clips.map((clip) => {
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
  }));
},
  
  setDraggingClip: (id) => set({ draggingClipId: id }),

  setDragOffset: (offset) => set({ dragOffset: offset }),
  
  setDropIndicator: (position) => set({ dropIndicatorPosition: position }),
  
repositionClip: (clipId, newStartTime) => {
  const state = get();
  state.pushToHistory();

  set((s) => {
    const updated = s.clips.map((clip) =>
      clip.id === clipId
        ? { ...clip, startTime: newStartTime }
        : clip
    );

    // 🔑 Sort clips by timeline position
    const sorted = [...updated].sort(
      (a, b) => a.startTime - b.startTime
    );

    // 🔑 Recalculate timeline duration
    const duration = Math.max(
      0,
      ...sorted.map(
        (c) => c.startTime + c.duration
      )
    );

    return {
      clips: sorted,
      duration,
    };
  });
},


  reorderClips: (from, to) => {
    const state = get();
    state.pushToHistory();

    set((s) => {
      const sortedClips = [...s.clips].sort((a, b) => a.startTime - b.startTime);
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
    });
  },
 pushToHistory: () => {
  const state = get();
  const snapshot = createSnapshot(state);

  set((s) => ({
    history: {
      past: [...s.history.past, snapshot].slice(-50),
      future: [],
    },
  }));
},
undo: () =>
  set((state) => {
    if (state.history.past.length === 0) return state;

    const previous =
      state.history.past[state.history.past.length - 1];

    const newPast =
      state.history.past.slice(0, -1);

    const currentSnapshot = createSnapshot(state);

    return {
      ...state,
      ...previous,
      history: {
        past: newPast,
        future: [currentSnapshot, ...state.history.future],
      },
    };
  }),
  redo: () =>
  set((state) => {
    if (state.history.future.length === 0) return state;

    const next = state.history.future[0];
    const newFuture = state.history.future.slice(1);

    const currentSnapshot = createSnapshot(state);

    return {
      ...state,
      ...next,
      history: {
        past: [...state.history.past, currentSnapshot],
        future: newFuture,
      },
    };
  }),

    
}));
