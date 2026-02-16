export interface TimelineClip {
  id: string;
  trackId: string;   // 🔥 NEW
  name: string;
  src: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  type: "video" | "audio" | "image";
  previewSessionId?: string;
  framesBaseUrl?: string;
  fps?: number;
}
export interface EditorSnapshot {
  clips: TimelineClip[]
  currentTime: number
  duration: number
  zoom: number
  activeClipId: string | null
}

export interface Track {
  id: string;
  type: "video" | "audio" | "image";
  clips: TimelineClip[];
}

export interface ClipPlayRange {
  start: number;
  end: number;
  duration: number;
}