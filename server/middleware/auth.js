import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(
      res,
      401,
      'You are not logged in. Please provide a valid Bearer token to access this resource.'
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillforge_dev_secret');

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return sendError(
        res,
        401,
        'The user belonging to this token no longer exists.'
      );
    }

    if (!currentUser.isActive) {
      return sendError(
        res,
        403,
        'Your account has been deactivated. Please contact support.'
      );
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Your session has expired. Please log in again.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillforge_dev_secret');
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) {
      req.user = currentUser;
    }
  } catch (error) {
    // Continue silently if invalid or expired token during optional auth
  }

  next();
};
