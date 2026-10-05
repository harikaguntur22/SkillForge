import mongoose from 'mongoose';
import {
  COLLABORATION_TYPES,
  COLLABORATION_STATUSES,
} from '../config/constants.js';

const ProjectCollaborationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
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
    type: {
      type: String,
      enum: Object.values(COLLABORATION_TYPES),
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Collaboration target role is required (e.g. React Developer)'],
      trim: true,
      maxlength: [80, 'Role cannot exceed 80 characters'],
    },
    status: {
      type: String,
      enum: Object.values(COLLABORATION_STATUSES),
      default: COLLABORATION_STATUSES.PENDING,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    responseMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Response message cannot exceed 500 characters'],
      default: '',
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple pending requests of the same type for the same project between the two parties
ProjectCollaborationSchema.index(
  { projectId: 1, senderId: 1, receiverId: 1, status: 1 },
  { unique: false }
);

export const ProjectCollaboration = mongoose.model(
  'ProjectCollaboration',
  ProjectCollaborationSchema
);

export default ProjectCollaboration;
