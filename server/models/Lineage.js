import mongoose from 'mongoose';

const lineageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  parentProjectId: mongoose.Schema.Types.ObjectId,
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  salvagerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
