import * as skillService from '../services/skillService.js';
import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const profile = await skillService.getPublicProfile(req.params.id);
    return sendSuccess(res, 200, profile, 'User public profile retrieved successfully.');
  } catch (error) {
    next(error);
  }
};
