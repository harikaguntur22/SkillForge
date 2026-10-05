import mongoose from 'mongoose';

const skillExchangeRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    offeredSkillIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    requestedSkillIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    compatibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    matchReasons: [
      {
        type: String,
      },
    ],
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying exchange requests between two users
skillExchangeRequestSchema.index({ senderId: 1, receiverId: 1, status: 1 });

export const SkillExchangeRequest = mongoose.model(
  'SkillExchangeRequest',
  skillExchangeRequestSchema
);
