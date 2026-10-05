import { Router } from 'express';
import * as userSkillController from '../controllers/userSkillController.js';
import {
  addUserSkillValidator,
  updateUserSkillValidator,
  addEvidenceValidator,
} from '../validators/skillValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All user skill endpoints require authentication
router.use(protect);

router.get('/', userSkillController.getUserSkills);
router.post('/', addUserSkillValidator, validateRequest, userSkillController.addUserSkill);
router.put('/:id', updateUserSkillValidator, validateRequest, userSkillController.updateUserSkill);
router.delete('/:id', userSkillController.deleteUserSkill);

// Evidence management
router.post('/:id/evidence', addEvidenceValidator, validateRequest, userSkillController.addEvidence);
router.delete('/:id/evidence/:evidenceId', userSkillController.deleteEvidence);

export default router;
