import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 201, result, 'Registration successful. Welcome to SkillForge!');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, 200, result, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user._id);
    return sendSuccess(res, 200, { user }, 'Current user profile fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateUserProfile(req.user._id, req.body);
    return sendSuccess(res, 200, { user: updatedUser }, 'Profile updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Stateless JWT: client discards token
    return sendSuccess(res, 200, {}, 'Successfully logged out.');
  } catch (error) {
    next(error);
  }
};
