import { extractTimelineFrames } from "../services/frame.service.js";
import { v4 as uuid } from "uuid";
import Project from "../models/project.model.js"
import { renderTimeline } from "../services/rander.service.js";

export const uploadPreviewFramesController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    const fps = Number(req.body.fps) || 1;
    const tempId = uuid();

    const framesDir = await extractTimelineFrames({
      videoPath: req.file.path,
      fps,
      tempId
    });

  res.json({
  previewSessionId: tempId,
  fps,
  baseUrl: `http://localhost:5000/frames/${tempId}`
});
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Preview generation failed"
    });
  }
};
4// controllers/render.controller.js



export const downloadProject = async (req,res)=>{

 try{

  const { projectId } = req.params

  const project = await Project.findById(projectId)
  // console.log("Project found for rendering:", project ? "Yes" : "No", projectId);
  if(!project){
   return res.status(404).json({message:"Project not found"})
  }

  const outputPath = await renderTimeline(project)

  res.download(outputPath)

 }catch(err){

  console.error(err)
  res.status(500).json({message:"Render failed"})

 }

}