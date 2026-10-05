import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('college')
    .trim()
    .notEmpty()
    .withMessage('College/University is required'),
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch/Field of study is required'),
  body('graduationYear')
    .notEmpty()
    .withMessage('Graduation year is required')
    .isInt({ min: 2000, max: 2035 })
    .withMessage('Graduation year must be between 2000 and 2035'),
  body('profileImage')
    .optional()
    .trim(),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('college')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('College cannot be empty'),
  body('branch')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Branch cannot be empty'),
  body('graduationYear')
    .optional()
    .isInt({ min: 2000, max: 2035 })
    .withMessage('Graduation year must be between 2000 and 2035'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('targetRole')
    .optional()
    .trim(),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array of strings'),
];
