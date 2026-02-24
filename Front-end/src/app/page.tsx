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

  const { clearClips, clips, uploadVideo } = useEditor();

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    const success = await uploadVideo(file);
    if (!success) {
      alert("Please upload a valid video file.");
    }
  };

  const handleRemoveVideo = () => {
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
          <VideoPreview onRemove={handleRemoveVideo} />
        </div>
      </div>
      
      {/* Resizable Bottom Timeline */}
      <Timeline />
    </div>
  );
}