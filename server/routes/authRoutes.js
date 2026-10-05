import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
} from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, updateProfileValidator, validateRequest, authController.updateProfile);

export default router;
