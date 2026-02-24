import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef } from "react";

export function AudioWaveform({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#5adaff",
      progressColor: "#ff5af1",
      height: 40,
    });

    ws.load(src);

    return () => ws.destroy();
  }, [src]);

  return <div ref={containerRef} />;
}