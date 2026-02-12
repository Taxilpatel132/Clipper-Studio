"use client";

import { Undo2, Redo2, Save, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useEffect, useState, } from "react";
import { useEditorStore } from "@/editor/store/editor.store";
export default function Navbar() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const undo = useEditorStore((s) => s.undo);
const redo = useEditorStore((s) => s.redo);
const canUndo = useEditorStore((s) => s.history.past.length > 0);
const canRedo = useEditorStore((s) => s.history.future.length > 0);


useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      undo();
    }

    if (e.ctrlKey && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [undo, redo]);
  return (
    <div className="w-full h-14 px-6 bg-[#0f1629] border-b border-[#5adaff]/20 flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-[#5adaff] tracking-wide font-mono">◆ AI Video Editor</h1>
        <Badge variant="outline" className="bg-[#ff5af1]/10 text-[#ff5af1] border-[#ff5af1]/30 text-xs">
          BETA
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-[#1a1f35] text-white/80 hover:bg-[#5adaff]/10 hover:text-[#5adaff] border-white/10 hover:border-[#5adaff]/40"
        >
          Create
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-[#1a1f35] text-white/80 hover:bg-[#ff5af1]/10 hover:text-[#ff5af1] border-white/10 hover:border-[#ff5af1]/40"
        >
          Edit
        </Button>
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-[#5adaff]/20 text-[#5adaff] hover:bg-[#5adaff]/30 border-[#5adaff]/40"
            >
              Export
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1629] border-[#5adaff]/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-[#5adaff]">Export Video</DialogTitle>
              <DialogDescription className="text-white/60">
                Choose your export settings and quality preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-[#1a1f35] border-white/10 text-white hover:bg-[#5adaff]/10">
                  720p HD
                </Button>
                <Button variant="outline" className="bg-[#1a1f35] border-white/10 text-white hover:bg-[#5adaff]/10">
                  1080p Full HD
                </Button>
                <Button variant="outline" className="bg-[#1a1f35] border-white/10 text-white hover:bg-[#5adaff]/10">
                  4K Ultra HD
                </Button>
                <Button variant="outline" className="bg-[#1a1f35] border-white/10 text-white hover:bg-[#5adaff]/10">
                  Custom
                </Button>
              </div>
              <Button className="w-full bg-[#5adaff] text-[#0a0f24] hover:bg-[#5adaff]/80">
                Start Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {/* Undo */}
          <Tooltip>
            <TooltipTrigger asChild>
             <Button 
  variant="ghost"
  size="icon"
  onClick={undo}
  disabled={!canUndo}
  className="hover:bg-[#5adaff]/10 hover:text-[#5adaff] text-white/70 disabled:opacity-40"
>
  <Undo2 size={18} />
</Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1f35] border-[#5adaff]/20">
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>

          {/* Redo */}
          <Tooltip>
            <TooltipTrigger asChild>
             <Button 
  variant="ghost"
  size="icon"
  onClick={redo}
  disabled={!canRedo}
  className="hover:bg-[#5adaff]/10 hover:text-[#5adaff] text-white/70 disabled:opacity-40"
>
  <Redo2 size={18} />
</Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1f35] border-[#5adaff]/20">
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>

          {/* Save */}
          <Button 
            variant="outline" 
            size="sm"
            className="bg-[#ff5af1]/20 text-[#ff5af1] hover:bg-[#ff5af1]/30 border-[#ff5af1]/30"
          >
            <Save size={16} className="mr-1.5" />
            Save
          </Button>

          {/* Download */}
          <Button 
            variant="outline" 
            size="sm"
            className="bg-[#5adaff]/20 text-[#5adaff] hover:bg-[#5adaff]/30 border-[#5adaff]/30"
          >
            <Download size={16} className="mr-1.5" />
            Download
          </Button>
        </div>
      </TooltipProvider>
    </div>
  );
}