import { create } from "zustand";
import { EditorSnapshot, TimelineClip } from '../types/clip.types';
//helper to create snapshots for undo/redo
const createSnapshot = (state: EditorState): EditorSnapshot => ({
  clips: JSON.parse(JSON.stringify(state.clips)),
  currentTime: state.currentTime,
  duration: state.duration,
  zoom: state.zoom,
  activeClipId: state.activeClipId,
});
// Helper function to upload media files
async function uploadMedia(file: File) {
  const form = new FormData()
  form.append("file", file)

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form
  })

  const data = await res.json()

  return data.url
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
  
  // Track management
  trackCounts: {
    video: number;
    overlay: number;
    audio: number;
  };
  
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
uploadImage: (file: File) => Promise<boolean>;
addTextOverlay: (text: string) => void;
addBackgroundOverlay: (color: string) => void;
mode: "idle" | "trimming" | "dragging";

setMode: (mode: "idle" | "trimming" | "dragging") => void;

applyTrim: (clipId: string) => void;

setDraggingClip: (id: string | null) => void;
reorderClips: (fromIndex: number, toIndex: number) => void;

  // Enhanced drag methods
  setDragOffset: (offset: number) => void;
  setDropIndicator: (position: number | null) => void;
  repositionClip: (clipId: string, newStartTime: number) => void;
  getAudioDuration: (src: string) => Promise<number>;
  uploadAudio: (file: File) => Promise<boolean>;
setClipVolume: (clipId: string, volume: number) => void
toggleClipMute: (clipId: string) => void
  addTrack: (group: "video" | "overlay" | "audio") => void;
  getNextAvailableTrack: (group: "video" | "overlay" | "audio") => number;
  setClipOpacity: (clipId: string, value: number) => void;
  removeClip: (clipId: string) => void;
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

  // Track counts - start with 1 track per group
  trackCounts: {
    video: 1,
    overlay: 1,
    audio: 1,
  },

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
  file:file,
  type: "video",
  group: "video",
  trackIndex: get().getNextAvailableTrack("video"),
  framesBaseUrl: data.baseUrl,
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
  getAudioDuration: (src: string): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio(src);
    audio.onloadedmetadata = () => resolve(audio.duration);
  });
},
uploadAudio: async (file: File) => {
  if (!file.type.startsWith("audio/")) return false;

  const url = URL.createObjectURL(file);

  const duration = await new Promise<number>((resolve) => {
    const audio = new Audio(url);
    audio.onloadedmetadata = () => resolve(audio.duration);
  });

  const clip: TimelineClip = {
    id: crypto.randomUUID(),
    name: file.name,
    src: url,
    startTime: 0,
    duration,
    trimStart: 0,
    trimEnd: 0,
    file:file,
    type: "audio",
    group: "audio",
    trackIndex: get().getNextAvailableTrack("audio"),
    volume: 1,
    muted: false,
  };

  get().addClip(clip);
  return true;
},

setClipVolume: (clipId, volume) =>
  set((state) => ({
    clips: state.clips.map((c) =>
      c.id === clipId ? { ...c, volume } : c
    ),
  })),

toggleClipMute: (clipId) =>
  set((state) => ({
    clips: state.clips.map((c) =>
      c.id === clipId ? { ...c, muted: !c.muted } : c
    ),
  })),

  // Track management
  addTrack: (group) =>
    set((state) => ({
      trackCounts: {
        ...state.trackCounts,
        [group]: state.trackCounts[group] + 1,
      },
    })),

  getNextAvailableTrack: (group) => {
    const state = get();
    const clips = state.clips.filter((c) => c.group === group);
    
    // Find first track with space or return last track
    for (let i = 0; i < state.trackCounts[group]; i++) {
      const trackClips = clips.filter((c) => c.trackIndex === i);
      if (trackClips.length === 0) return i;
    }
    
    // Return last track
    return state.trackCounts[group] - 1;
  },
  uploadImage: async (file: File) => {
  if (!file.type.startsWith("image/")) return false;

  const url = URL.createObjectURL(file);

  const clip: TimelineClip = {
    id: crypto.randomUUID(),
    name: file.name,
    src: url,
    startTime: get().currentTime,
    duration: 5,
    trimStart: 0,
    trimEnd: 0,
    file:file,
    type: "image",
    group: "overlay",
    trackIndex: get().getNextAvailableTrack("overlay"),
     opacity: 1
  };

  get().addClip(clip);
  return true;
},addTextOverlay: (text) => {
  const clip: TimelineClip = {
    id: crypto.randomUUID(),
    name: "Text",
    src: "",
    startTime: get().currentTime,
    duration: 5,
    trimStart: 0,
    trimEnd: 0,
    type: "text",
    group: "overlay",
    trackIndex: get().getNextAvailableTrack("overlay"),
    text,
    fontSize: 48,
    color: "#ffffff",
    opacity: 1
  };

  get().addClip(clip);
},

addBackgroundOverlay: (color) => {
  const clip: TimelineClip = {
    id: crypto.randomUUID(),
    name: "Background",
    src: "",
    startTime: 0,
    duration: 20,
    trimStart: 0,
    trimEnd: 0,
    type: "background",
    group: "overlay",
    trackIndex: get().getNextAvailableTrack("overlay"),
    backgroundColor: color,
    
  };

  get().addClip(clip);
},
setClipOpacity: (clipId, value) =>
  set((state) => ({
    clips: state.clips.map((c) =>
      c.id === clipId ? { ...c, opacity: value } : c
    ),
  })),

removeClip: (clipId) => {
  const state = get();
  state.pushToHistory();

  const clip = state.clips.find((c) => c.id === clipId);
  if (clip && clip.src.startsWith("blob:")) {
    URL.revokeObjectURL(clip.src);
  }

  set((s) => {
    const remaining = s.clips.filter((c) => c.id !== clipId);
    const duration = remaining.length
      ? Math.max(...remaining.map((c) => c.startTime + c.duration))
      : 0;

    return {
      clips: remaining,
      activeClipId: s.activeClipId === clipId ? null : s.activeClipId,
      duration,
    };
  });
},

}));
