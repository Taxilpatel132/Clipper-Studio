"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import VideoPreview from "@/components/VideoPreview";
import Timeline from "@/components/Timeline";
import ToolPanel from "@/components/ToolPanel";
import { useEditor } from "@/hooks/useEditor";
import { useEditorStore } from "@/editor/store/editor.store";

export default function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedTool, setSelectedTool] = useState<string | null>("video");
  const [loading, setLoading] = useState(true);

  const { clearClips, clips, uploadVideo } = useEditor();

  // Load project data from backend on mount
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/projects/${projectId}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Failed to load project");

        const data = await res.json();
        const project = data.project;

        // Map saved clips back to TimelineClip shape
        const restoredClips = (project.clips ?? []).map((c: any) => ({
          id: c.id,
          type: c.type,
          group: c.group,
          trackIndex: c.trackIndex,
          name: c.sourceUrl?.split("/").pop() || c.type,
          src: c.sourceUrl || "",
          startTime: c.startTime,
          duration: c.duration,
          trimStart: c.trimStart ?? 0,
          trimEnd: c.trimEnd ?? 0,
          volume: c.volume ?? 1,
          muted: c.muted ?? false,
          opacity: c.opacity ?? 1,
          text: c.text,
          fontSize: c.fontSize,
          color: c.color,
          backgroundColor: c.backgroundColor,
        }));

        useEditorStore.setState({
          projectId: project._id,
          projectName: project.projectName,
          clips: restoredClips,
          duration: project.duration,
          currentTime: 0,
          activeClipId: null,
        });
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0f24]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#5adaff] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading project…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0f24] cyber-grid">
      {/* Fixed Top Navbar */}
      <div className="shrink-0">
        <Navbar />
      </div>

      {/* Main Content Area - Flexible Height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Fixed Width */}
        <div className="shrink-0">
          <Sidebar onSelectTool={setSelectedTool} />
        </div>

        {/* Tool Panel - Fixed Width */}
        <div className="w-80 shrink-0 bg-[#0f1629] border-r border-[#5adaff]/20 overflow-y-auto">
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
