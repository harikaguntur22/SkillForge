import { body, param, query } from 'express-validator';
import {
  PROJECT_CATEGORIES,
  PROJECT_DIFFICULTIES,
  PROJECT_STATUSES,
  SKILL_LEVELS,
} from '../config/constants.js';

export const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required.')
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters.'),

  body('tagline')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Tagline cannot exceed 200 characters.'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required.'),

  body('category')
    .isIn(Object.values(PROJECT_CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(PROJECT_CATEGORIES).join(', ')}.`),

  body('difficulty')
    .isIn(Object.values(PROJECT_DIFFICULTIES))
    .withMessage(`Difficulty must be one of: ${Object.values(PROJECT_DIFFICULTIES).join(', ')}.`),

  body('estimatedDuration')
    .trim()
    .notEmpty()
    .withMessage('Estimated duration is required (e.g. "4-6 weeks").'),

  body('teamSize')
    .isInt({ min: 1, max: 12 })
    .withMessage('Team size must be an integer between 1 and 12.'),

  body('requiredSkills')
    .isArray({ min: 1 })
    .withMessage('Project must have at least one required skill.'),

  body('requiredSkills.*.skillId')
    .isMongoId()
    .withMessage('Each required skill must specify a valid skillId.'),

  body('requiredSkills.*.name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required.'),

  body('requiredSkills.*.level')
    .optional()
    .isIn(Object.values(SKILL_LEVELS))
    .withMessage(`Skill level must be one of: ${Object.values(SKILL_LEVELS).join(', ')}.`),

  body('requiredRoles')
    .optional()
    .isArray()
    .withMessage('Required roles must be an array.'),

  body('requiredRoles.*.roleName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role name cannot be empty.'),

  body('deliverables')
    .optional()
    .isArray()
    .withMessage('Deliverables must be an array of strings.'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings.'),

  body('githubUrl')
    .optional()
    .trim(),

  body('demoUrl')
    .optional()
    .trim(),
];

export const updateProjectValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID format.'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage('Title must be between 3 and 120 characters.'),

  body('tagline')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Tagline cannot exceed 200 characters.'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project description cannot be empty.'),

  body('category')
    .optional()
    .isIn(Object.values(PROJECT_CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(PROJECT_CATEGORIES).join(', ')}.`),

  body('difficulty')
    .optional()
    .isIn(Object.values(PROJECT_DIFFICULTIES))
    .withMessage(`Difficulty must be one of: ${Object.values(PROJECT_DIFFICULTIES).join(', ')}.`),

  body('estimatedDuration')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Estimated duration cannot be empty.'),

  body('teamSize')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Team size must be an integer between 1 and 12.'),

  body('status')
    .optional()
    .isIn(Object.values(PROJECT_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(PROJECT_STATUSES).join(', ')}.`),

  body('requiredSkills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Project must have at least one required skill.'),

  body('requiredSkills.*.skillId')
    .optional()
    .isMongoId()
    .withMessage('Valid skillId required.'),

  body('requiredSkills.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill name is required.'),

  body('requiredSkills.*.level')
    .optional()
    .isIn(Object.values(SKILL_LEVELS)),

  body('requiredRoles')
    .optional()
    .isArray()
    .withMessage('Required roles must be an array.'),

  body('deliverables')
    .optional()
    .isArray(),

  body('tags')
    .optional()
    .isArray(),

  body('githubUrl')
    .optional()
    .trim(),

  body('demoUrl')
    .optional()
    .trim(),
];

export const getProjectByIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID format.'),
];
