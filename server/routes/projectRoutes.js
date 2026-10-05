import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import * as collaborationController from '../controllers/collaborationController.js';
import {
  createProjectValidator,
  updateProjectValidator,
  getProjectByIdValidator,
} from '../validators/projectValidator.js';
import {
  inviteCollaboratorValidator,
  requestToJoinValidator,
  updateMemberRoleValidator,
} from '../validators/collaborationValidator.js';
import { validateRequest } from '../middleware/validate.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Recommendations (Protected - must be defined before /:id)
router.get('/recommended', protect, projectController.getRecommendedProjects);

// Public / Optional Auth browsing
router.get('/', optionalAuth, projectController.getProjects);
router.get('/:id', optionalAuth, getProjectByIdValidator, validateRequest, projectController.getProjectById);

// Protected creation, edit, deletion
router.post('/', protect, createProjectValidator, validateRequest, projectController.createProject);
router.put('/:id', protect, updateProjectValidator, validateRequest, projectController.updateProject);
router.delete('/:id', protect, getProjectByIdValidator, validateRequest, projectController.deleteProject);

// Collaborator Recommendations & Invites
router.get(
  '/:id/collaborators/recommended',
  protect,
  getProjectByIdValidator,
  validateRequest,
  collaborationController.getRecommendedCollaborators
);
router.post(
  '/:id/collaborators/invite',
  protect,
  inviteCollaboratorValidator,
  validateRequest,
  collaborationController.inviteCollaborator
);
router.post(
  '/:id/collaborators/join',
  protect,
  requestToJoinValidator,
  validateRequest,
  collaborationController.requestToJoinProject
);
router.get(
  '/:id/collaborators/requests',
  protect,
  getProjectByIdValidator,
  validateRequest,
  collaborationController.getProjectCollaborationRequests
);

// Team Members Management
router.get(
  '/:id/members',
  optionalAuth,
  getProjectByIdValidator,
  validateRequest,
  collaborationController.getProjectMembers
);
router.put(
  '/:id/members/:userId/role',
  protect,
  updateMemberRoleValidator,
  validateRequest,
  collaborationController.updateProjectMemberRole
);
router.delete(
  '/:id/members/:userId',
  protect,
  collaborationController.removeProjectMember
);
router.post(
  '/:id/leave',
  protect,
  getProjectByIdValidator,
  validateRequest,
  collaborationController.leaveProject
);

export default router;
