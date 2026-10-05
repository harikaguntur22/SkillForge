import { Router } from 'express';
import * as skillController from '../controllers/skillController.js';
import { createSkillValidator } from '../validators/skillValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public: Get all approved canonical skills
router.get('/', skillController.getSkills);

// Protected: Propose/Add canonical skill
router.post('/', protect, createSkillValidator, validateRequest, skillController.createSkill);

export default router;
