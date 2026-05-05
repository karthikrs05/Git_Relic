import mongoose from 'mongoose';

const lineageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  parentProjectId: mongoose.Schema.Types.ObjectId,
  donor: {
    userId: String,
    username: String,
  },
  salvager: {
    userId: String,
    username: String,
  },
  generationNumber: {
    type: Number,
    default: 1,
  },
  transferredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Lineage', lineageSchema);
