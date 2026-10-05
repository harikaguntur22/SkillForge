import mongoose from 'mongoose';
import { DISCUSSION_CATEGORIES } from '../config/constants.js';

const DiscussionReplySchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Reply message is required'],
      trim: true,
      maxlength: [2000, 'Reply cannot exceed 2000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ProjectDiscussionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Discussion topic is required'],
      trim: true,
      maxlength: [150, 'Topic cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Discussion content is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      enum: Object.values(DISCUSSION_CATEGORIES),
      default: DISCUSSION_CATEGORIES.GENERAL,
      index: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    replies: [DiscussionReplySchema],
  },
  {
    timestamps: true,
  }
);

ProjectDiscussionSchema.index({ projectId: 1, pinned: -1, createdAt: -1 });

export const ProjectDiscussion = mongoose.model('ProjectDiscussion', ProjectDiscussionSchema);
export default ProjectDiscussion;
