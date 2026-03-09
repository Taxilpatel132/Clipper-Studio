import mongoose from "mongoose";

const clipSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },

    type: {
      type: String,
      enum: ["video", "audio", "image", "text", "background"],
      required: true
    },

    group: {
      type: String,
      enum: ["video", "audio", "overlay"],
      required: true
    },

    trackIndex: { type: Number, required: true },

    sourceUrl: { type: String },

    startTime: { type: Number, required: true },
    duration: { type: Number, required: true },

    trimStart: { type: Number, default: 0 },
    trimEnd: { type: Number, default: 0 },

    volume: { type: Number, default: 1 },
    muted: { type: Boolean, default: false },

    opacity: { type: Number, default: 1 },

    // text specific
    text: { type: String },
    fontSize: { type: Number },
    color: { type: String },

    // background specific
    backgroundColor: { type: String }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
   
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    projectName: {
      type: String,
      required: true
    },

    clips: {
      type: [clipSchema],
      default: []
    },

    duration: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["draft", "rendering", "completed"],
      default: "draft"
    },
    projectSize: 
    { type: Number, default: 0 }
    
  },
   
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
