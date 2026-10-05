import { body, param } from 'express-validator';
import { SKILL_LEVELS, SKILL_INTENTS } from '../config/constants.js';

export const createSkillValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ max: 60 })
    .withMessage('Skill name cannot exceed 60 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Frontend',
      'Backend',
      'Database',
      'Mobile',
      'AI/ML',
      'DevOps/Cloud',
      'Cybersecurity',
      'Core CS',
      'UI/UX',
      'Other',
    ])
    .withMessage('Invalid skill category'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Description cannot exceed 300 characters'),
];

export const addUserSkillValidator = [
  body('type')
    .notEmpty()
    .withMessage('Skill type is required')
    .isIn(Object.values(SKILL_INTENTS))
    .withMessage("Skill type must be either 'TEACH' or 'LEARN'"),
  body('level')
    .optional()
    .isIn(Object.values(SKILL_LEVELS))
    .withMessage('Invalid skill level'),
  body('yearsExperience')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  body('skillId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Skill ID format'),
  body('skillName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Skill name must be between 1 and 60 characters'),
];

export const updateUserSkillValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user skill ID'),
  body('level')
    .optional()
    .isIn(Object.values(SKILL_LEVELS))
    .withMessage('Invalid skill level'),
  body('yearsExperience')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
];

export const addEvidenceValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user skill ID'),
  body('projectName')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role in project is required')
    .isLength({ max: 80 })
    .withMessage('Role cannot exceed 80 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project contribution description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('githubUrl')
    .optional()
    .trim(),
  body('demoUrl')
    .optional()
    .trim(),
];
