export interface TimelineClip {
  id: string;
  name: string;
  src: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  type: "video" | "audio" | "image";
}

export interface ClipPlayRange {
  start: number;
  end: number;
  duration: number;
}