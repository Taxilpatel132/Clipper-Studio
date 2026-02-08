"use client";

import { formatTime } from "@/editor/engine";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStart: () => void;
  onSplit: () => void;
}

export function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onStart,
  onSplit,
}: PlaybackControlsProps) {
  return (
    <div className="px-4 py-2 border-b border-white/10">
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={onPrevious}
          className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
        >
          ⏮ Prev
        </button>

        <button
          onClick={() => (isPlaying ? onPause() : onPlay())}
          className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={onSplit}
          className="px-3 py-1 bg-yellow-600 text-black text-xs rounded"
        >
          ✂ Split
        </button>

        <button
          onClick={onNext}
          className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
        >
          Next ⏭
        </button>

        <button
          onClick={onStart}
          className="px-3 py-1 bg-gray-700 text-white text-xs rounded"
        >
          ⏮ Start
        </button>

        <span className="text-xs text-white/70 ml-4 font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}