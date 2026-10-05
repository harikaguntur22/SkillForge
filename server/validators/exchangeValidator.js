import { body, param } from 'express-validator';

export const createRequestValidator = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid Receiver ID format'),
  body('offeredSkillIds')
    .optional()
    .isArray()
    .withMessage('Offered skills must be an array'),
  body('requestedSkillIds')
    .optional()
    .isArray()
    .withMessage('Requested skills must be an array'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
];

export const updateRequestStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid request ID format'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['ACCEPTED', 'REJECTED', 'CANCELLED'])
    .withMessage('Status must be ACCEPTED, REJECTED, or CANCELLED'),
];

export const createSessionValidator = [
  body('exchangeRequestId')
    .notEmpty()
    .withMessage('Exchange request ID is required')
    .isMongoId()
    .withMessage('Invalid exchange request ID'),
  body('mentorId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid mentor ID is required'),
  body('learnerId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid learner ID is required'),
  body('skillId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid skill ID is required'),
  body('scheduledAt')
    .notEmpty()
    .withMessage('Scheduled date and time is required')
    .isISO8601()
    .withMessage('Please provide a valid ISO date string'),
  body('durationMinutes')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Duration must be between 15 and 180 minutes'),
  body('meetingUrl')
    .optional()
    .trim(),
];

export const submitFeedbackValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid session ID'),
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5 stars'),
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters'),
];
