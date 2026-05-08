import mongoose from 'mongoose';

const pitchSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  salvagerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pitchText: {
    type: String,
    required: true,
  },
  prLink: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: Date,
});

export default mongoose.model('Pitch', pitchSchema);
