import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: true,
  },
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: ['tweaks', 'playlists', 'notes', 'important-links', 'pdfs', 'images'],
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: tags => tags.length <= 10,
      message: 'Cannot have more than 10 tags'
    }
  },
  url: {
    type: String,
    validate: {
      validator: v => !v || /^https?:\/\//.test(v),
      message: 'URL must start with http:// or https://'
    }
  },
  videoCount: {
    type: Number,
    min: [0, 'Video count cannot be negative']
  },
  content: {
    type: String,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  about: {
    type: String,
    maxlength: [1000, 'About cannot exceed 1000 characters']
  },

  // File metadata
  fileName: {
    type: String,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  fileSize: {
    type: Number,
    max: [50 * 1024 * 1024, 'File size cannot exceed 50MB'] // 50MB limit
  },
  fileType: {
    type: String,
    enum: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    message: '{VALUE} is not a supported file type'
  },
  fileData: {
    type: String, // base64 if storing in DB
    select: false // Don't send in queries unless explicitly requested
  },
  filePath: {
    type: String, // path in filesystem or cloud storage
  }

}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Hide file data in JSON unless specifically fetched
      if (ret.fileData) delete ret.fileData;
      return ret;
    }
  }
});

// Indexes for faster queries
contentSchema.index({ user: 1, type: 1 });
contentSchema.index({ user: 1, createdAt: -1 });
contentSchema.index({ tags: 1 });

export default mongoose.model('Content', contentSchema);
