import mongoose from 'mongoose';

const videoProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoFiles: [{
    filename: String,
    originalName: String,
    size: Number,
    duration: Number,
    resolution: {
      width: Number,
      height: Number
    },
    format: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeline: {
    tracks: [{
      type: String, // video, audio, text, etc.
      clips: [{
        startTime: Number,
        endTime: Number,
        mediaId: String,
        effects: []
      }]
    }]
  },
  settings: {
    outputFormat: {
      type: String,
      default: 'mp4'
    },
    resolution: {
      width: { type: Number, default: 1920 },
      height: { type: Number, default: 1080 }
    },
    frameRate: {
      type: Number,
      default: 30
    }
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'failed'],
    default: 'draft'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastModified on save
videoProjectSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

const VideoProject = mongoose.model('VideoProject', videoProjectSchema);

export default VideoProject;