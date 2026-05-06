import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: String,
  description: String,
  techStack: [String],
  commitCount: Number,
  lastActivity: Date,
  extractedAt: Date,
  metadata: {
    languages: [String],
    lineCount: Number,
    fileCount: Number,
  },
  status: {
    type: String,
    enum: ['pending_scan', 'scanned', 'pending_review', 'published', 'salvaged', 'failed'],
    default: 'pending_scan',
  },
  securityScanResult: {
    passed: Boolean,
    issues: [String],
  },
  aiAnalysis: {
    summary: String,
    failureReason: String,
    roadmap: [String],
    difficulty: String,
    estimatedHours: String,
    analyzedAt: { type: Date, default: Date.now },
  },
  storageLocation: String,
  currentOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: function() {
      return this.donorId;
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Project', projectSchema);
