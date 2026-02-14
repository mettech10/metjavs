import mongoose from 'mongoose';

const sensoryResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moduleType: {
      type: String,
      enum: ['reaction-time', 'memory-sequence', 'focus-score'],
      required: true
    },
    score: { type: Number, required: true },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const SensoryResult = mongoose.model('SensoryResult', sensoryResultSchema);
