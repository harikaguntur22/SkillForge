import { body } from 'express-validator';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  MILESTONE_STATUSES,
  DISCUSSION_CATEGORIES,
  RESOURCE_TYPES,
  PROJECT_STATUSES,
} from '../config/constants.js';

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Task description cannot exceed 2000 characters.'),
  body('status')
    .optional()
    .isIn(Object.values(TASK_STATUSES))
    .withMessage('Invalid task status.'),
  body('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITIES))
    .withMessage('Invalid task priority.'),
  body('assigneeId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid assignee ID.'),
  body('milestoneId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid milestone ID.'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid date format.'),
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Task description cannot exceed 2000 characters.'),
  body('status')
    .optional()
    .isIn(Object.values(TASK_STATUSES))
    .withMessage('Invalid task status.'),
  body('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITIES))
    .withMessage('Invalid task priority.'),
  body('assigneeId')
    .optional({ nullable: true }),
  body('milestoneId')
    .optional({ nullable: true }),
  body('dueDate')
    .optional({ nullable: true }),
];

export const createMilestoneValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Milestone title is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Milestone title must be between 2 and 150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Milestone description cannot exceed 1000 characters.'),
  body('targetDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Target date must be a valid date format.'),
  body('status')
    .optional()
    .isIn(Object.values(MILESTONE_STATUSES))
    .withMessage('Invalid milestone status.'),
];

export const createDiscussionValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Discussion title is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Title must be between 2 and 150 characters.'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Discussion message is required.')
    .isLength({ min: 1, max: 3000 })
    .withMessage('Message must be between 1 and 3000 characters.'),
  body('category')
    .optional()
    .isIn(Object.values(DISCUSSION_CATEGORIES))
    .withMessage('Invalid discussion category.'),
];

export const replyDiscussionValidator = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Reply message is required.')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Reply must be between 1 and 2000 characters.'),
];

export const addResourceValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Resource title is required.')
    .isLength({ min: 1, max: 120 })
    .withMessage('Title cannot exceed 120 characters.'),
  body('url')
    .trim()
    .notEmpty()
    .withMessage('Resource URL is required.')
    .isURL()
    .withMessage('A valid URL must be provided.'),
  body('type')
    .optional()
    .isIn(Object.values(RESOURCE_TYPES))
    .withMessage('Invalid resource type.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters.'),
];

export const updateSettingsValidator = [
  body('githubUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('GitHub URL must be a valid URL.'),
  body('demoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Demo URL must be a valid URL.'),
  body('status')
    .optional()
    .isIn(Object.values(PROJECT_STATUSES))
    .withMessage('Invalid project status.'),
];
