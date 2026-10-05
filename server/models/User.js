import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.STUDENT,
      index: true,
    },
    college: {
      type: String,
      required: [true, 'Please provide your college or university name'],
      trim: true,
      index: true,
    },
    branch: {
      type: String,
      required: [true, 'Please provide your branch or major (e.g. Computer Science)'],
      trim: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Please provide your expected graduation year'],
      min: [2000, 'Graduation year must be 2000 or later'],
      max: [2035, 'Graduation year must be 2035 or earlier'],
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    socialLinks: {
      github: { type: String, default: '', trim: true },
      linkedin: { type: String, default: '', trim: true },
      portfolio: { type: String, default: '', trim: true },
    },
    interests: [{ type: String, trim: true }],
    targetRole: {
      type: String,
      default: 'Full Stack Developer',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
