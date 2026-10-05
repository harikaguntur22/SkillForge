import { Router } from 'express';
import * as sessionController from '../controllers/sessionController.js';
import {
  createSessionValidator,
  submitFeedbackValidator,
} from '../validators/exchangeValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All session routes require authentication
router.use(protect);

router.post('/', createSessionValidator, validateRequest, sessionController.createSession);
router.get('/', sessionController.getSessions);
router.put('/:id', sessionController.updateSession);
router.post('/:id/feedback', submitFeedbackValidator, validateRequest, sessionController.submitFeedback);

export default router;
