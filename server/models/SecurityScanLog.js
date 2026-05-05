import mongoose from 'mongoose';

const securityScanLogSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  passed: Boolean,
  issueCount: Number,
  issues: [
    {
      file: String,
      type: { type: String }, // Mongoose reserved keyword fix
      line: String,
      severity: String,
    },
  ],
  rawOutput: String,
  scannedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('SecurityScanLog', securityScanLogSchema);
