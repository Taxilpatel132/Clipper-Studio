"use client";

import { useState, useRef, useEffect } from "react";
import { useTimelineControls } from "./hooks/useTimelineControls";
import { PlaybackControls } from "./PlaybackControls";
import { TimelineRuler } from "./TimelineRuler";
import { TimelineClipBlock } from "./TimelineClipBlock";
import { useEditorStore } from "@/editor/store/editor.store";
import { getClipsForTrack } from "@/editor/utils/timeline.utils";
import { Plus, GripHorizontal } from "lucide-react";

export default function Timeline() {
  const [timelineHeight, setTimelineHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const resizeStartHeight = useRef(0);
  const {
    // Refs
    timelineRef,

    // State
    clips,
    activeClipId,
    currentTime,
    duration,
    draggingClipId,
    dragOffset,
    dropIndicatorPosition,
    isPlaying,
    zoom,
    TIMELINE_SCALE,
    timelineWidth,

    // Actions
    play,
    pause,

    // Handlers
    handleTimelineClick,
    handleClipMouseDown,
    handleClipClick,
    handleTrimMouseDown,
    startPlayheadDrag,
    clampTimeToSoftTrim,

    // Navigation
    goToNextClip,
    goToPreviousClip,
    goToStart,
    splitClipAtCurrentTime,
  } = useTimelineControls();
  const setZoom = useEditorStore((s) => s.setZoom);
  const trackCounts = useEditorStore((s) => s.trackCounts);
  const addTrack = useEditorStore((s) => s.addTrack);
  
  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = timelineHeight;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = resizeStartY.current - e.clientY;
      const newHeight = Math.max(200, Math.min(800, resizeStartHeight.current + deltaY));
      setTimelineHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      className="w-full bg-[#0f1629] border-t border-white/10 flex flex-col" 
      style={{ height: `${timelineHeight}px` }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        className={`w-full h-1 bg-[#5adaff]/20 hover:bg-[#5adaff]/40 cursor-ns-resize flex items-center justify-center group transition-colors ${
          isResizing ? "bg-[#5adaff]/60" : ""
        }`}
      >
        <GripHorizontal className="w-4 h-4 text-[#5adaff]/50 group-hover:text-[#5adaff] transition-colors" />
      </div>

      {/* Playback Controls */}
      <PlaybackControls
  isPlaying={isPlaying}
  currentTime={currentTime}
  duration={duration}
  onPlay={play}
  onPause={pause}
  onPrevious={goToPreviousClip}
  onNext={goToNextClip}
  onStart={goToStart}
  onSplit={splitClipAtCurrentTime}
  zoom={zoom}
  onZoomChange={(z) => setZoom(z)}
/>

      {/* Timeline Area */}
      <div className="overflow-x-auto overflow-y-auto flex-1">
        <div
          ref={timelineRef}
          className="relative"
          style={{ width: timelineWidth }}
        >
          {/* Ruler */}
          <TimelineRuler
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            zoom={zoom}
            scale={TIMELINE_SCALE}
            dropIndicatorPosition={dropIndicatorPosition}
            clampTimeToSoftTrim={clampTimeToSoftTrim}
            onClick={handleTimelineClick}
            onPlayheadMouseDown={startPlayheadDrag}
          />

        {/* Timeline Tracks */}
<div className="space-y-2">

  {/* VIDEO GROUP */}
  <div className="space-y-1">
    <div className="px-2 py-1 flex items-center justify-between">
      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Video Tracks
      </span>
      <button
        onClick={() => addTrack("video")}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#5adaff]/10 hover:bg-[#5adaff]/20 text-[#5adaff] rounded transition-colors"
        title="Add Video Track"
      >
        <Plus className="w-3 h-3" />
        Track
      </button>
    </div>
    {Array.from({ length: trackCounts.video }, (_, trackIndex) => (
      <div
        key={`video-${trackIndex}`}
        className="relative h-12 bg-[#0a0f24] border-b border-white/10 hover:bg-[#13203a]"
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/30 pointer-events-none">
          V{trackIndex + 1}
        </div>
        {getClipsForTrack(clips, "video", trackIndex).map((clip) => (
          <TimelineClipBlock
            key={clip.id}
            clip={clip}
            isActive={clip.id === activeClipId}
            isDragging={draggingClipId === clip.id}
            dragOffset={dragOffset}
            scale={TIMELINE_SCALE}
            onMouseDown={handleClipMouseDown}
            onClick={handleClipClick}
            onTrimMouseDown={handleTrimMouseDown}
          />
        ))}
      </div>
    ))}
  </div>

  {/* OVERLAY GROUP */}
  <div className="space-y-1">
    <div className="px-2 py-1 flex items-center justify-between">
      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Overlay Tracks
      </span>
      <button
        onClick={() => addTrack("overlay")}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#ff5af1]/10 hover:bg-[#ff5af1]/20 text-[#ff5af1] rounded transition-colors"
        title="Add Overlay Track"
      >
        <Plus className="w-3 h-3" />
        Track
      </button>
    </div>
    {Array.from({ length: trackCounts.overlay }, (_, trackIndex) => (
      <div
        key={`overlay-${trackIndex}`}
        className="relative h-12 bg-[#0a0f24] border-b border-white/10 hover:bg-[#13203a]"
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/30 pointer-events-none">
          O{trackIndex + 1}
        </div>
        {getClipsForTrack(clips, "overlay", trackIndex).map((clip) => (
          <TimelineClipBlock
            key={clip.id}
            clip={clip}
            isActive={clip.id === activeClipId}
            isDragging={draggingClipId === clip.id}
            dragOffset={dragOffset}
            scale={TIMELINE_SCALE}
            onMouseDown={handleClipMouseDown}
            onClick={handleClipClick}
            onTrimMouseDown={handleTrimMouseDown}
          />
        ))}
      </div>
    ))}
  </div>

  {/* AUDIO GROUP */}
  <div className="space-y-1">
    <div className="px-2 py-1 flex items-center justify-between">
      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Audio Tracks
      </span>
      <button
        onClick={() => addTrack("audio")}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] rounded transition-colors"
        title="Add Audio Track"
      >
        <Plus className="w-3 h-3" />
        Track
      </button>
    </div>
    {Array.from({ length: trackCounts.audio }, (_, trackIndex) => (
      <div
        key={`audio-${trackIndex}`}
        className="relative h-12 bg-[#0a0f24] border-b border-white/10 hover:bg-[#13203a]"
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/30 pointer-events-none">
          A{trackIndex + 1}
        </div>
        {getClipsForTrack(clips, "audio", trackIndex).map((clip) => (
          <TimelineClipBlock
            key={clip.id}
            clip={clip}
            isActive={clip.id === activeClipId}
            isDragging={draggingClipId === clip.id}
            dragOffset={dragOffset}
            scale={TIMELINE_SCALE}
            onMouseDown={handleClipMouseDown}
            onClick={handleClipClick}
            onTrimMouseDown={handleTrimMouseDown}
          />
        ))}
      </div>
    ))}
  </div>

</div>
        </div>
      </div>
    </div>
  );
}