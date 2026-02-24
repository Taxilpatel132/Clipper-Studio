"use client";

import { Upload, Sparkle, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useEditorStore } from "@/editor/store/editor.store";

interface Props {
  selectedTool: string;
  onUploadFile: (file: File ) => Promise<void>;
  hasVideo?: boolean;
  onRemoveVideo?: () => void;
}

export default function ToolPanel({
  selectedTool,
  onUploadFile,
  hasVideo = false,
  onRemoveVideo,
}: Props) {
  const clips = useEditorStore((s) => s.clips);
const uploadAudio = useEditorStore((s) => s.uploadAudio);
const setClipVolume = useEditorStore((s) => s.setClipVolume);
const toggleClipMute = useEditorStore((s) => s.toggleClipMute);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    
    try {
    await onUploadFile(file);
    console.log("File uploaded:", file.name);
  } catch (error) {
    console.error("Error uploading file:", error);
  }finally {
   // e.currentTarget.value = "";
  }
  };

  const currentTool = selectedTool || "video";

  return (
    <div className="h-full p-4">{/* Container styling now handled by parent */}

      <h1 className="text-xl font-semibold mb-2 capitalize text-[#5adaff] tracking-wide">{currentTool}</h1>
      <p className="text-sm text-white/60 mb-6">Manage your {currentTool} content</p>

      {currentTool === "video" && (
        <div className="space-y-6">
          {/* Upload */}
          <Card className="bg-[#1a1f35] border-white/10 hover:border-[#5adaff]/40 transition-all cursor-pointer group">
            <CardContent className="p-4">
              <label htmlFor="video-upload" className="flex items-center gap-3 cursor-pointer">
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="p-2 bg-[#5adaff]/20 rounded-xl group-hover:bg-[#5adaff]/30 transition-all border border-[#5adaff]/40">
                  <Upload size={20} className="text-[#5adaff]" />
                </div>
                <div>
                  <div className="font-medium text-white block tracking-wide">Upload Video</div>
                  <div className="text-xs text-white/50 mt-1">
                    <Badge variant="outline" className="bg-[#5adaff]/10 text-[#5adaff] border-[#5adaff]/30 text-xs">
                      MP4, MOV, AVI
                    </Badge>
                  </div>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="flex flex-col items-center gap-2 h-auto p-4 bg-gradient-to-br from-[#5adaff]/20 to-[#ff5af1]/20 hover:from-[#5adaff]/30 hover:to-[#ff5af1]/30 border border-white/10 text-white"
              variant="outline"
            >
              <Sparkle size={20} />
              <span className="text-sm font-medium">Generate</span>
            </Button>
            <Button 
              className="flex flex-col items-center gap-2 h-auto p-4 bg-[#1a1f35] hover:bg-[#ff5af1]/10 border-white/10 hover:border-[#ff5af1]/40 text-white"
              variant="outline"
            >
              <Upload size={20} />
              <span className="text-sm font-medium">Upload</span>
            </Button>
          </div>

          {/* Remove Video */}
          {hasVideo && onRemoveVideo && (
            <>
              <Separator className="bg-white/10" />
              <Button
                onClick={onRemoveVideo}
                variant="destructive"
                className="w-full bg-[#ff5af1]/10 text-[#ff5af1] hover:bg-[#ff5af1]/20 border border-[#ff5af1]/30"
                title="Remove uploaded video"
              >
                <Trash2 size={16} className="mr-2" />
                Remove Video
              </Button>
            </>
          )}

          {/* AI Avatars */}
          <Card className="bg-[#1a1f35] border-white/10">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#ff5af1] tracking-wide">AI Avatars</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#5adaff] hover:text-[#5adaff]/80 hover:bg-[#5adaff]/10 h-auto p-1"
                >
                  View all <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <Card 
                    key={i}
                    className="aspect-square bg-gradient-to-br from-[#1a1f35] to-[#0f1629] border-white/10 hover:border-[#5adaff]/40 transition-all cursor-pointer relative overflow-hidden group"
                  >
                    <CardContent className="p-0 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#5adaff]/5 to-[#ff5af1]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge variant="outline" className="bg-transparent border-white/20 text-white/50">
                          AI {i}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
     {currentTool === "audio" && (
  <Card className="bg-[#1a1f35] border-white/10">
    <CardContent className="space-y-4">

      <CardTitle className="text-[#5adaff] text-lg">
        Audio
      </CardTitle>

      {/* Upload */}
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadAudio(file);
        }}
        className="text-white text-sm"
      />

      {/* Audio List */}
      <div className="space-y-3">
        {clips
          .filter((c) => c.type === "audio")
          .map((clip) => (
            <div
              key={clip.id}
              className="p-3 bg-[#0f1629] rounded border border-white/10 space-y-2"
            >
              <div className="flex justify-between text-sm text-white">
                <span>{clip.name}</span>

                <button
                  onClick={() => toggleClipMute(clip.id)}
                  className="text-xs bg-gray-700 px-2 py-1 rounded"
                >
                  {clip.muted ? "Unmute" : "Mute"}
                </button>
              </div>

              {/* Volume */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={clip.volume ?? 1}
                onChange={(e) =>
                  setClipVolume(clip.id, parseFloat(e.target.value))
                }
                className="w-full accent-cyan-400"
              />

              <div className="text-xs text-white/60">
                Volume: {(clip.volume ?? 1).toFixed(2)}
              </div>
            </div>
          ))}
      </div>
    </CardContent>
  </Card>
)}
      {currentTool !== "video" && currentTool !== "audio" && (
        <Card className="bg-[#1a1f35] border-white/10">
          <CardContent className="text-center py-12">
            <CardTitle className="text-[#5adaff] text-lg tracking-wide mb-2">Tools for {currentTool}</CardTitle>
            <CardDescription className="text-white/50 mb-4">Coming soon...</CardDescription>
            <Progress 
              value={30} 
              className="w-full bg-[#1a1f35] [&>div]:bg-gradient-to-r [&>div]:from-[#5adaff] [&>div]:to-[#ff5af1]"
            />
            <Badge variant="outline" className="mt-4 bg-[#5adaff]/10 text-[#5adaff] border-[#5adaff]/30">
              In Development
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}