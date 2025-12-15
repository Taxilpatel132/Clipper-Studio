"use client";

import { Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefObject } from "react";

interface Props {
  src: string | null;
  onRemove?: () => void;
  videoRef?: RefObject<HTMLVideoElement>;
}

export default function VideoPreview({ src, onRemove, videoRef }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* KEY CHANGE IS HERE */}
      <Card className="h-full aspect-video max-w-full max-h-full bg-black border-[#5adaff]/20 hover:border-[#5adaff]/40 transition-all duration-300 overflow-hidden relative neon-glow">
        <CardContent className="p-0 h-full">
          {src ? (
            <>
              <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-contain bg-black"
              />

              {onRemove && (
                <Button
                  onClick={onRemove}
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 bg-[#0f1629]/80 hover:bg-[#ff5af1]/20 border border-[#ff5af1]/40 text-[#ff5af1]"
                >
                  <Trash2 size={16} />
                </Button>
              )}

              <div className="absolute bottom-4 left-4">
                <Badge
                  variant="outline"
                  className="bg-[#0f1629]/80 border-[#5adaff]/40 text-[#5adaff]"
                >
                  <Play size={12} className="mr-1" />
                  Ready to Edit
                </Badge>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-[#5adaff] text-lg font-medium mb-2">
                  Video Preview
                </div>
                <div className="text-white/50 text-sm mb-4">
                  Upload a video to get started
                </div>
                <Badge
                  variant="outline"
                  className="bg-[#5adaff]/10 border-[#5adaff]/30 text-[#5adaff]"
                >
                  No Media Loaded
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
