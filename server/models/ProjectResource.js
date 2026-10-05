import mongoose from 'mongoose';
import { RESOURCE_TYPES } from '../config/constants.js';

const ProjectResourceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(RESOURCE_TYPES),
      default: RESOURCE_TYPES.DOCUMENTATION,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ProjectResourceSchema.index({ projectId: 1, createdAt: -1 });

export const ProjectResource = mongoose.model('ProjectResource', ProjectResourceSchema);
export default ProjectResource;
