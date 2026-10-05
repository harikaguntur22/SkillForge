import mongoose from 'mongoose';
import { SKILL_LEVELS, SKILL_INTENTS } from '../config/constants.js';

const evidenceSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role in project is required'],
      trim: true,
      maxlength: [80, 'Role cannot exceed 80 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description or contribution summary is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    demoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, timestamps: true }
);

const userSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(SKILL_INTENTS), // 'TEACH' or 'LEARN'
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: Object.values(SKILL_LEVELS), // 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
      default: SKILL_LEVELS.BEGINNER,
    },
    yearsExperience: {
      type: Number,
      default: 0,
      min: [0, 'Years of experience cannot be negative'],
      max: [50, 'Years of experience must be realistic'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    evidence: [evidenceSchema],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate assignment of the same skill with the same intent to a user
userSkillSchema.index({ userId: 1, skillId: 1, type: 1 }, { unique: true });

export const UserSkill = mongoose.model('UserSkill', userSkillSchema);
