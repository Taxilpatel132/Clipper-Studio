"use client";

import { useTimelineControls } from "./hooks/useTimelineControls";
import { PlaybackControls } from "./PlaybackControls";
import { TimelineRuler } from "./TimelineRuler";
import { TimelineClipBlock } from "./TimelineClipBlock";

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
      />

      {/* Timeline Area */}
      <div className="overflow-x-auto overflow-y-hidden">
        <div
          ref={timelineRef}
          className="relative"
          style={{ width: timelineWidth, height: 80 }}
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

          {/* Clips Container */}
          <div className="relative h-12 bg-[#0a0f24] border-b border-white/10">
            {clips.map((clip) => (
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
  );
}