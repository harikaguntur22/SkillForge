import * as exchangeService from '../services/exchangeService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const createSession = async (req, res, next) => {
  try {
    const session = await exchangeService.createSession(req.user._id, req.body);
    return sendSuccess(res, 201, { session }, 'Learning session scheduled successfully.');
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await exchangeService.getUserSessions(req.user._id);
    return sendSuccess(res, 200, { sessions }, 'User sessions retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const session = await exchangeService.updateSessionStatus(
      req.user._id,
      req.params.id,
      req.body.status,
      req.body.mentorNotes
    );
    return sendSuccess(res, 200, { session }, 'Session updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const submitFeedback = async (req, res, next) => {
  try {
    const session = await exchangeService.submitFeedback(
      req.user._id,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, { session }, 'Session feedback submitted successfully.');
  } catch (error) {
    next(error);
  }
};
