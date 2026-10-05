import mongoose from 'mongoose';
import {
  PROJECT_DIFFICULTIES,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  SKILL_LEVELS,
} from '../config/constants.js';

const RequiredSkillSchema = new mongoose.Schema(
  {
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: Object.values(SKILL_LEVELS),
      default: SKILL_LEVELS.INTERMEDIATE,
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const RequiredRoleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: [true, 'Role name is required (e.g. React Developer, UI/UX Designer)'],
      trim: true,
      maxlength: [80, 'Role name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, 'Role description cannot exceed 300 characters'],
    },
    skills: {
      type: [String],
      default: [],
    },
    spots: {
      type: Number,
      default: 1,
      min: [1, 'Spots must be at least 1'],
      max: [10, 'Spots cannot exceed 10'],
    },
    filled: {
      type: Number,
      default: 0,
      min: [0, 'Filled spots cannot be negative'],
    },
  },
  { _id: true }
);

const ProjectMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: 'Developer',
      trim: true,
      maxlength: [80, 'Role name cannot exceed 80 characters'],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'LEFT', 'REMOVED'],
      default: 'ACTIVE',
    },
  },
  { _id: true, timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Project title must be at least 3 characters'],
      maxlength: [120, 'Project title cannot exceed 120 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(PROJECT_CATEGORIES),
      index: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: Object.values(PROJECT_DIFFICULTIES),
      default: PROJECT_DIFFICULTIES.INTERMEDIATE,
      index: true,
    },
    estimatedDuration: {
      type: String,
      required: [true, 'Estimated duration is required (e.g. 4-6 weeks)'],
      trim: true,
    },
    teamSize: {
      type: Number,
      required: [true, 'Team size is required'],
      min: [1, 'Team size must be at least 1'],
      max: [12, 'Team size cannot exceed 12'],
      default: 3,
    },
    requiredSkills: {
      type: [RequiredSkillSchema],
      validate: {
        validator: function (skills) {
          return Array.isArray(skills) && skills.length > 0;
        },
        message: 'A project must require at least one skill.',
      },
    },
    requiredRoles: {
      type: [RequiredRoleSchema],
      default: [],
    },
    members: {
      type: [ProjectMemberSchema],
      default: [],
    },
    deliverables: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUSES),
      default: PROJECT_STATUSES.OPEN,
      index: true,
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    demoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    bannerImage: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search
ProjectSchema.index({
  title: 'text',
  tagline: 'text',
  description: 'text',
  tags: 'text',
  'requiredSkills.name': 'text',
});

export const Project = mongoose.model('Project', ProjectSchema);
export default Project;
