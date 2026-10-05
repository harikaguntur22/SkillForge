import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

// Public: Get user public profile and skills/evidence
router.get('/:id', userController.getUserProfile);

export default router;
