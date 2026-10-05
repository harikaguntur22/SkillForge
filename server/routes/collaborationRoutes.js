import { Router } from 'express';
import * as collaborationController from '../controllers/collaborationController.js';
import { respondCollaborationValidator } from '../validators/collaborationValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Student collaboration requests & invites inbox/outbox
router.get('/my-requests', protect, collaborationController.getMyCollaborationRequests);

// Respond to an invitation or join request (Accept or Reject)
router.put(
  '/:id/respond',
  protect,
  respondCollaborationValidator,
  validateRequest,
  collaborationController.respondToCollaborationRequest
);

// Cancel a pending request sent by the current user
router.put(
  '/:id/cancel',
  protect,
  collaborationController.cancelCollaborationRequest
);

export default router;
