"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoPreview from "../components/VideoPreview";
import Timeline from "../components/Timeline";
import ToolPanel from "../components/ToolPanel";

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>("video");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  const handleUpload = (file: File | null) => {
    if (!file) return;

    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
  };

  const handleRemoveVideo = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
      setVideoSrc(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  // Attach video element listeners for play/pause, duration, and time updates
  const attachVideoListeners = () => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handleLoaded = () => setDuration(video.duration || 0);
    const handlePlayState = () => setIsPlaying(!video.paused);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("play", handlePlayState);
    video.addEventListener("pause", handlePlayState);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("play", handlePlayState);
      video.removeEventListener("pause", handlePlayState);
    };
  };

  useEffect(() => {
    const cleanup = attachVideoListeners();
    return cleanup;
  }, [videoSrc]);

  // Playback control handlers
  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  };

  const seekBy = (deltaSeconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(Math.max(video.currentTime + deltaSeconds, 0), video.duration || Infinity);
    video.currentTime = next;
  };

  const formatTime = (value: number) => {
    if (!Number.isFinite(value)) return "00:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0f24] cyber-grid">
      {/* Fixed Top Navbar */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>
      
      {/* Main Content Area - Flexible Height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Fixed Width */}
        <div className="flex-shrink-0">
          <Sidebar onSelectTool={setSelectedTool} />
        </div>
        
        {/* Tool Panel - Fixed Width */}
        <div className="w-80 flex-shrink-0 bg-[#0f1629] border-r border-[#5adaff]/20 overflow-y-auto">
          <ToolPanel
            selectedTool={selectedTool || "video"}
            onUploadFile={handleUpload}
            hasVideo={!!videoSrc}
            onRemoveVideo={handleRemoveVideo}
          />
        </div>
        
        {/* Video Preview - Flexible Width */}
        <div className="flex-1 flex items-center justify-center bg-[#0a0f24] p-6 overflow-hidden">
          <VideoPreview src={videoSrc} onRemove={handleRemoveVideo} />
        </div>
      </div>
      
      {/* Fixed Bottom Timeline */}
      <div className="flex-shrink-0">
        <Timeline />
      </div>
    </div>
  );
}