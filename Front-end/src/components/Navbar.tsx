"use client";

import { Undo2, Redo2, Save, Download, LogIn, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/editor/store/editor.store";
import { saveProject } from "@/editor/actions/save.action";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const undo = useEditorStore((s) => s.undo);
const redo = useEditorStore((s) => s.redo);
const canUndo = useEditorStore((s) => s.history.past.length > 0);
const canRedo = useEditorStore((s) => s.history.future.length > 0);

const handleSave = async () => {
  const wasNew = useEditorStore.getState().projectId === null;
  try {
    setSaving(true);
    console.log("Saving project...");
    const data = await saveProject();
    console.log("Project saved successfully!");

    // If this was a brand-new project, redirect to /edit/[projectId]
    if (wasNew && data.projectId) {
      router.replace(`/edit/${data.projectId}`);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to save project");
  } finally {
    setSaving(false);
  }
};
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
        <div className="size-8 rounded-lg bg-linear-to-br from-[#5adaff] to-[#3b82f6] flex items-center justify-center">
          <span className="text-sm font-black text-[#0a0f24]">CS</span>
        </div>
        <h1 className="text-xl font-semibold text-[#5adaff] tracking-wide font-mono">Clipper Studio</h1>
        <Badge variant="outline" className="bg-[#ff5af1]/10 text-[#ff5af1] border-[#ff5af1]/30 text-xs">
          BETA
        </Badge>
        <span className="hidden md:inline text-xs text-white/30 ml-2 italic">
          Cut. Create. Conquer.
        </span>
      </div>

      {user ? (
        /* ── Logged-in: editor tools ── */
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
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} className="mr-1.5" />
              {saving ? "Saving..." : "Save"}
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
      ) : (
        /* ── Not logged-in: auth buttons ── */
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/login")}
            className="bg-[#5adaff]/20 text-[#5adaff] hover:bg-[#5adaff]/30 border-[#5adaff]/40 gap-1.5"
          >
            <LogIn size={16} />
            Login
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/register")}
            className="bg-[#5adaff] text-[#0a0f24] hover:bg-[#5adaff]/80 font-semibold gap-1.5"
          >
            <UserPlus size={16} />
            Register
          </Button>
        </div>
      )}
    </div>
  );
}