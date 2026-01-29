export type EditorMode = "idle" | "dragging" | "trimming" | "selecting";

export interface SnapPoint {
  time: number;
  type: "clip-start" | "clip-end" | "playhead" | "marker";
  clipId?: string;
}

export interface DragState {
  clipId: string | null;
  startX: number;
  startTime: number;
  offset: number;
}

export interface TrimState {
  clipId: string | null;
  type: "start" | "end" | null;
  initialTrimStart: number;
  initialTrimEnd: number;
}