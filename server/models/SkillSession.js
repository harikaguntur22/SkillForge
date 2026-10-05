import mongoose from 'mongoose';

const skillSessionSchema = new mongoose.Schema(
  {
    exchangeRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchangeRequest',
      required: true,
      index: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time are required'],
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: [15, 'Session must be at least 15 minutes'],
      max: [180, 'Session cannot exceed 180 minutes'],
    },
    meetingUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true,
    },
    mentorNotes: {
      type: String,
      default: '',
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      trim: true,
    },
    learnerFeedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: {
        type: String,
        maxlength: [500, 'Review cannot exceed 500 characters'],
        trim: true,
      },
      submittedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

skillSessionSchema.index({ mentorId: 1, scheduledAt: -1 });
skillSessionSchema.index({ learnerId: 1, scheduledAt: -1 });

export const SkillSession = mongoose.model('SkillSession', skillSessionSchema);
