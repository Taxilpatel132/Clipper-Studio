"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoPreview from "../components/VideoPreview";
import Timeline from "../components/Timeline";
import ToolPanel from "../components/ToolPanel";
import { useEditor } from "@/hooks/useEditor";

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>("video");
  const [newVideoSrc, setNewVideoSrc] = useState<string | null>(null);

  const { clearClips, clips } = useEditor();

  const handleUpload = (file: File | null) => {
    if (!file) return;

    // Create URL for the new video and pass it to VideoPreview
    const url = URL.createObjectURL(file);
    setNewVideoSrc(url);
    
    // Clear the new video src after a short delay to allow VideoPreview to process it
    setTimeout(() => setNewVideoSrc(null), 100);
  };

  const handleRemoveVideo = () => {
    // Clear all clips
    clearClips();
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
            hasVideo={clips.length > 0}
            onRemoveVideo={handleRemoveVideo}
          />
        </div>
        
        {/* Video Preview - Flexible Width */}
        <div className="flex-1 flex items-center justify-center bg-[#0a0f24] p-6 overflow-hidden">
          <VideoPreview newVideoSrc={newVideoSrc} onRemove={handleRemoveVideo} />
        </div>
      </div>
      
      {/* Fixed Bottom Timeline */}
      <div className="flex-shrink-0">
        <Timeline />
      </div>
    </div>
  );
}