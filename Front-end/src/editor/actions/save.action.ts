import { uploadFile } from "@/editor/api/media";
import { useEditorStore } from "@/editor/store/editor.store";

export async function saveProject() {
  const state = useEditorStore.getState();

  const uploadedClips = await Promise.all(
    state.clips.map(async (clip) => {

      let sourceUrl = clip.src;

      if (
        (clip.type === "video" ||
         clip.type === "audio" ||
         clip.type === "image") &&
        clip.file
      ) {
        sourceUrl = await uploadFile(clip.file);
      }

      return {
        id: clip.id,
        type: clip.type,
        group: clip.group,
        trackIndex: clip.trackIndex,
        sourceUrl,

        startTime: clip.startTime,
        duration: clip.duration,

        trimStart: clip.trimStart,
        trimEnd: clip.trimEnd,

        volume: clip.volume,
        muted: clip.muted,

        opacity: clip.opacity,

        text: clip.text,
        fontSize: clip.fontSize,
        color: clip.color,

        backgroundColor: clip.backgroundColor
      };
    })
  );

  const res = await fetch("http://localhost:5000/api/projects/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("accessToken")}`
    },
   credentials: "include",
   
    body: JSON.stringify({
      projectId: state.projectId,
      projectName: state.projectName,
      clips: uploadedClips,
      duration: state.duration
    })
  });

  const data = await res.json();

  console.log("Saved:", data);

  return data;
}