import { body, param } from 'express-validator';
import { COLLABORATION_ACTIONS } from '../config/constants.js';

export const inviteCollaboratorValidator = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('candidateUserId').isMongoId().withMessage('Valid candidate user ID is required'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Target role is required (e.g. React Developer)')
    .isLength({ max: 80 })
    .withMessage('Role cannot exceed 80 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Invitation message cannot exceed 500 characters'),
];

export const requestToJoinValidator = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role you wish to apply for is required')
    .isLength({ max: 80 })
    .withMessage('Role cannot exceed 80 characters'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Application message cannot exceed 500 characters'),
];

export const respondCollaborationValidator = [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('action')
    .trim()
    .toUpperCase()
    .isIn(Object.values(COLLABORATION_ACTIONS))
    .withMessage("Action must be either 'ACCEPT' or 'REJECT'"),
  body('responseMessage')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Response message cannot exceed 500 characters'),
];

export const updateMemberRoleValidator = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  param('userId').isMongoId().withMessage('Invalid member user ID'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('New role is required')
    .isLength({ max: 80 })
    .withMessage('Role cannot exceed 80 characters'),
];
