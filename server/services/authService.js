import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'skillforge_dev_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export const registerUser = async (userData) => {
  const { name, email, password, college, branch, graduationYear, profileImage } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 409, [
      { field: 'email', message: 'Email is already registered' },
    ]);
  }

  const defaultAvatar =
    profileImage && profileImage.trim() !== ''
      ? profileImage
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`;

  const user = new User({
    name,
    email,
    passwordHash: password, // will be hashed by pre('save') hook
    college,
    branch,
    graduationYear,
    profileImage: defaultAvatar,
  });

  await user.save();

  const token = generateToken(user._id, user.role);

  return {
    user: user.toJSON(),
    token,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated. Please contact support.', 403);
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(user._id, user.role);

  return {
    user: user.toJSON(),
    token,
  };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user.toJSON();
};

export const updateUserProfile = async (userId, updateData) => {
  const allowedUpdates = [
    'name',
    'college',
    'branch',
    'graduationYear',
    'profileImage',
    'bio',
    'socialLinks',
    'interests',
    'targetRole',
  ];

  const filteredUpdates = {};
  for (const key of Object.keys(updateData)) {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updateData[key];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: filteredUpdates },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new AppError('User not found.', 404);
  }

  return updatedUser.toJSON();
};
