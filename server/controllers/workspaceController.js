import * as workspaceService from '../services/workspaceService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspace(
      req.params.projectId,
      req.user._id
    );
    return sendSuccess(res, 200, workspace, 'Project workspace loaded successfully.');
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await workspaceService.createTask(
      req.params.projectId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 201, { task }, 'Task created successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await workspaceService.updateTask(
      req.params.projectId,
      req.params.taskId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 200, { task }, 'Task updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await workspaceService.updateTaskStatus(
      req.params.projectId,
      req.params.taskId,
      req.user._id,
      req.body.status
    );
    return sendSuccess(res, 200, { task }, 'Task status updated.');
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteTask(
      req.params.projectId,
      req.params.taskId,
      req.user._id
    );
    return sendSuccess(res, 200, result, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const createMilestone = async (req, res, next) => {
  try {
    const milestone = await workspaceService.createMilestone(
      req.params.projectId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 201, { milestone }, 'Milestone created successfully.');
  } catch (error) {
    next(error);
  }
};

export const updateMilestone = async (req, res, next) => {
  try {
    const milestone = await workspaceService.updateMilestone(
      req.params.projectId,
      req.params.milestoneId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 200, { milestone }, 'Milestone updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteMilestone = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteMilestone(
      req.params.projectId,
      req.params.milestoneId,
      req.user._id
    );
    return sendSuccess(res, 200, result, 'Milestone deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const createDiscussion = async (req, res, next) => {
  try {
    const discussion = await workspaceService.createDiscussion(
      req.params.projectId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 201, { discussion }, 'Discussion topic posted.');
  } catch (error) {
    next(error);
  }
};

export const addDiscussionReply = async (req, res, next) => {
  try {
    const discussion = await workspaceService.addDiscussionReply(
      req.params.projectId,
      req.params.discussionId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 201, { discussion }, 'Reply posted successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteDiscussion = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteDiscussion(
      req.params.projectId,
      req.params.discussionId,
      req.user._id
    );
    return sendSuccess(res, 200, result, 'Discussion deleted successfully.');
  } catch (error) {
    next(error);
  }
};

export const addResource = async (req, res, next) => {
  try {
    const resource = await workspaceService.addResource(
      req.params.projectId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 201, { resource }, 'Resource added successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const result = await workspaceService.deleteResource(
      req.params.projectId,
      req.params.resourceId,
      req.user._id
    );
    return sendSuccess(res, 200, result, 'Resource removed.');
  } catch (error) {
    next(error);
  }
};

export const updateWorkspaceSettings = async (req, res, next) => {
  try {
    const project = await workspaceService.updateWorkspaceSettings(
      req.params.projectId,
      req.user._id,
      req.body
    );
    return sendSuccess(res, 200, { project }, 'Workspace settings updated.');
  } catch (error) {
    next(error);
  }
};

export const claimSkillEvidence = async (req, res, next) => {
  try {
    const result = await workspaceService.addProjectToSkillEvidence(
      req.params.projectId,
      req.user._id,
      req.body
    );
    return sendSuccess(
      res,
      200,
      result,
      'Project successfully added as verified skill evidence!'
    );
  } catch (error) {
    next(error);
  }
};
