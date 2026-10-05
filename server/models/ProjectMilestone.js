import mongoose from 'mongoose';
import { MILESTONE_STATUSES } from '../config/constants.js';

const ProjectMilestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      minlength: [2, 'Milestone title must be at least 2 characters'],
      maxlength: [150, 'Milestone title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    targetDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(MILESTONE_STATUSES),
      default: MILESTONE_STATUSES.PLANNED,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ProjectMilestoneSchema.index({ projectId: 1, targetDate: 1 });

export const ProjectMilestone = mongoose.model('ProjectMilestone', ProjectMilestoneSchema);
export default ProjectMilestone;
