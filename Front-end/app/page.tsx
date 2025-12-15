"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import VideoPreview from "@/components/VideoPreview";
import Timeline from "@/components/Timeline";
import ToolPanel from "@/components/ToolPanel";

/* ───────────────── CONFIG ───────────────── */
const MIN_TIMELINE = 140;
const MAX_TIMELINE = 360;
const DIVIDER_HEIGHT = 6;
/* ───────────────────────────────────────── */

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>("video");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  /* ───────────── Timeline Resize State ───────────── */
  const [timelineHeight, setTimelineHeight] = useState(200);
  const dragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);
  /* ───────────────────────────────────────────────── */

  /* ───────────── Cleanup Object URL ───────────── */
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  /* ───────────── Upload / Remove ───────────── */
  const handleUpload = (file: File | null) => {
    if (!file) return;

    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoSrc(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoSrc(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  /* ───────────── Video Listeners ───────────── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onLoad = () => setDuration(video.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onLoad);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onLoad);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [videoSrc]);

  /* ───────────── Divider Drag Logic ───────────── */
  const onDividerMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startHeight.current = timelineHeight;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;

      const diff = startY.current - e.clientY;
      const next = Math.min(
        MAX_TIMELINE,
        Math.max(MIN_TIMELINE, startHeight.current + diff)
      );

      setTimelineHeight(next);
    };

    const onUp = () => (dragging.current = false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  /* ───────────────── RENDER ───────────────── */
  return (
    <div className="h-screen flex bg-[#0a0f24] cyber-grid">
      {/* Sidebar */}
      <Sidebar onSelectTool={setSelectedTool} />

      {/* Right Side */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* MAIN AREA (Video + Tools) */}
        <div
          className="flex overflow-hidden"
          style={{
            height: `calc(100% - ${timelineHeight + DIVIDER_HEIGHT}px)`,
          }}
        >
          {/* Tool Panel */}
          <div className="w-80 bg-[#0f1629] border-r border-[#5adaff]/20 overflow-y-auto thin-scrollbar">
  <ToolPanel
    selectedTool={selectedTool || "video"}
    onUploadFile={handleUpload}
    hasVideo={!!videoSrc}
    onRemoveVideo={handleRemoveVideo}
  />
</div>

          

          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center bg-[#0a0f24] p-6">
            <VideoPreview
              src={videoSrc}
              onRemove={handleRemoveVideo}
          
            />
          </div>
        </div>

        {/* DRAG DIVIDER */}
        <div
          onMouseDown={onDividerMouseDown}
          className="h-[2px] cursor-ns-resize bg-[#5adaff]/20 hover:bg-[#5adaff]/40"
        />

          <Timeline />
       
      </div>
    </div>
  );
}
