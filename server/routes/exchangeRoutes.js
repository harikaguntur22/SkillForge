import { Router } from 'express';
import * as exchangeController from '../controllers/exchangeController.js';
import {
  createRequestValidator,
  updateRequestStatusValidator,
} from '../validators/exchangeValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All exchange routes require authentication
router.use(protect);

router.get('/matches', exchangeController.getMatches);
router.post('/requests', createRequestValidator, validateRequest, exchangeController.createRequest);
router.get('/requests', exchangeController.getRequests);
router.put('/requests/:id', updateRequestStatusValidator, validateRequest, exchangeController.updateRequestStatus);

export default router;
