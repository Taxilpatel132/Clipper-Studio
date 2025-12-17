import mongoose from "mongoose";

const clipSchema = new mongoose.Schema(
  {
    clipId: {
      type: String,
      required: true
    },

    sourceUrl: {
      type: String,
      required: true
    },

    trim: {
      start: { type: Number, default: 0 },
      end: { type: Number } // seconds
    },

    volume: {
      type: Number,
      default: 1
    }
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
      required: true
    },

    timeline: {
      type: Object,
      required: true
      /*
        example:
        {
          tracks: [
            { clipId: "c1", start: 0 },
            { clipId: "c2", start: 25 }
          ]
        }
      */
    },

    status: {
      type: String,
      enum: ["draft", "rendering", "completed"],
      default: "draft"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
