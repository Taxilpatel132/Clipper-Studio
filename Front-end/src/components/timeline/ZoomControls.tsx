"use client";

import { useEditorStore } from "@/editor/store/editor.store";

interface ZoomControlsProps {
  zoom: number;
}

export function ZoomControls({ zoom }: ZoomControlsProps) {
  const setZoom = useEditorStore((state) => state.setZoom);

  return (
    <div className="flex gap-2 px-4 py-2">
      <button
        onClick={() => setZoom(zoom - 0.25)}
        className="px-2 py-1 bg-gray-700 text-white text-xs rounded"
      >
        −
      </button>

      <span className="text-xs text-white/70">Zoom: {zoom.toFixed(2)}x</span>

      <button
        onClick={() => setZoom(zoom + 0.25)}
        className="px-2 py-1 bg-gray-700 text-white text-xs rounded"
      >
        +
      </button>
    </div>
  );
}