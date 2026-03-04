export interface TimelineClip {
  id: string;
  name: string;
  src: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  type: "video" | "audio" | "image" | "text" | "background";
  file?: File;
  previewSessionId?: string;
  framesBaseUrl?: string;
  fps?: number;
  volume?: number;
  muted?: boolean;
  // ✅ Group-based hierarchy
  group: "video" | "overlay" | "audio";
  trackIndex: number;
  // overlay props
text?: string;
fontSize?: number;
color?: string;
bgColor?: string;

imageFit?: "cover" | "contain";

backgroundColor?: string;
opacity?: number;
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