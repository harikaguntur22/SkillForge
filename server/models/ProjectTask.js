import mongoose from 'mongoose';
import { TASK_STATUSES, TASK_PRIORITIES } from '../config/constants.js';

const ProjectTaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Task title must be at least 2 characters'],
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUSES),
      default: TASK_STATUSES.TODO,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITIES),
      default: TASK_PRIORITIES.MEDIUM,
      index: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectMilestone',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
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

// Compound index for querying tasks by project and status
ProjectTaskSchema.index({ projectId: 1, status: 1, order: 1 });

export const ProjectTask = mongoose.model('ProjectTask', ProjectTaskSchema);
export default ProjectTask;
