"use client";

import { useTimelineControls } from "./hooks/useTimelineControls";
import { PlaybackControls } from "./PlaybackControls";
import { TimelineRuler } from "./TimelineRuler";
import { TimelineClipBlock } from "./TimelineClipBlock";
import { useEditorStore } from "@/editor/store/editor.store";
export default function Timeline() {
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
  return (
    <div className="w-full bg-[#0f1629] border-t border-white/10">
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
      <div className="overflow-x-auto overflow-y-hidden">
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

  {/* VIDEO TRACKS */}
  {["video-1", "video-2"].map((trackId) => (
    <div
      key={trackId}
      className="relative h-12 bg-[#0a0f24] border-b border-white/10 hover:bg-[#13203a]"
    >
      {clips
        .filter((clip) => clip.trackId === trackId)
        .map((clip) => (
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

  {/* AUDIO TRACK */}
  <div className="relative h-12 bg-[#0a0f24] border-b border-white/10 hover:bg-[#13203a]">
    {clips
      .filter((clip) => clip.trackId === "audio-1")
      .map((clip) => (
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

  {/* IMAGE TRACK */}
  <div className="relative h-12 bg-[#0a0f24] border-b border-white/10 hover:bg-[#13203a]">
    {clips
      .filter((clip) => clip.trackId === "image-1")
      .map((clip) => (
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

</div>
        </div>
      </div>
    </div>
  );
}