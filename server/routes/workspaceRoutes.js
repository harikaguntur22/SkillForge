import { Router } from 'express';
import * as workspaceController from '../controllers/workspaceController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createTaskValidator,
  updateTaskValidator,
  createMilestoneValidator,
  createDiscussionValidator,
  replyDiscussionValidator,
  addResourceValidator,
  updateSettingsValidator,
} from '../validators/workspaceValidator.js';

const router = Router();

// All workspace routes require authentication
router.use('/:projectId/workspace', protect);

// Workspace Data Overview & Progress
router.get('/:projectId/workspace', workspaceController.getWorkspace);

// Task Management
router.post(
  '/:projectId/workspace/tasks',
  createTaskValidator,
  validateRequest,
  workspaceController.createTask
);
router.put(
  '/:projectId/workspace/tasks/:taskId',
  updateTaskValidator,
  validateRequest,
  workspaceController.updateTask
);
router.patch(
  '/:projectId/workspace/tasks/:taskId/status',
  workspaceController.updateTaskStatus
);
router.delete(
  '/:projectId/workspace/tasks/:taskId',
  workspaceController.deleteTask
);

// Milestone Management
router.post(
  '/:projectId/workspace/milestones',
  createMilestoneValidator,
  validateRequest,
  workspaceController.createMilestone
);
router.put(
  '/:projectId/workspace/milestones/:milestoneId',
  workspaceController.updateMilestone
);
router.delete(
  '/:projectId/workspace/milestones/:milestoneId',
  workspaceController.deleteMilestone
);

// Discussions & Team Threads
router.post(
  '/:projectId/workspace/discussions',
  createDiscussionValidator,
  validateRequest,
  workspaceController.createDiscussion
);
router.post(
  '/:projectId/workspace/discussions/:discussionId/replies',
  replyDiscussionValidator,
  validateRequest,
  workspaceController.addDiscussionReply
);
router.delete(
  '/:projectId/workspace/discussions/:discussionId',
  workspaceController.deleteDiscussion
);

// Project Resources & Docs
router.post(
  '/:projectId/workspace/resources',
  addResourceValidator,
  validateRequest,
  workspaceController.addResource
);
router.delete(
  '/:projectId/workspace/resources/:resourceId',
  workspaceController.deleteResource
);

// Project Settings, URLs & Status
router.put(
  '/:projectId/workspace/settings',
  updateSettingsValidator,
  validateRequest,
  workspaceController.updateWorkspaceSettings
);

// Claim Project Completion as Verified Skill Evidence
router.post(
  '/:projectId/workspace/claim-evidence',
  workspaceController.claimSkillEvidence
);

export default router;
