import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { ProjectTask } from '../models/ProjectTask.js';
import { ProjectMilestone } from '../models/ProjectMilestone.js';
import { ProjectDiscussion } from '../models/ProjectDiscussion.js';
import { ProjectResource } from '../models/ProjectResource.js';
import { Skill } from '../models/Skill.js';
import { UserSkill } from '../models/UserSkill.js';
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  MILESTONE_STATUSES,
  PROJECT_STATUSES,
  SKILL_INTENTS,
  SKILL_LEVELS,
} from '../config/constants.js';
import AppError from '../utils/AppError.js';

/**
 * Helper to verify that the requesting user is either the creator
 * or an active member of the project team.
 */
export const verifyProjectMembership = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('Project not found.', 404);
  }

  const isCreator = project.creatorId.toString() === userId.toString();
  const activeMember = project.members.find(
    (m) => m.userId.toString() === userId.toString() && m.status === 'ACTIVE'
  );

  if (!isCreator && !activeMember) {
    throw new AppError(
      'Access denied. You must be an active collaborator or project creator to access this workspace.',
      403
    );
  }

  const memberRole = isCreator
    ? 'Project Lead (Creator)'
    : activeMember
      ? activeMember.role
      : 'Member';

  return { project, isCreator, isMember: !!activeMember, memberRole };
};

/**
 * Get complete project workspace data
 */
export const getWorkspace = async (projectId, userId) => {
  const { project, isCreator, memberRole } = await verifyProjectMembership(
    projectId,
    userId
  );

  // Populate creator, active members, and required skills
  await project.populate([
    { path: 'creatorId', select: 'name email avatar college branch graduationYear' },
    { path: 'members.userId', select: 'name email avatar college branch graduationYear' },
    { path: 'requiredSkills.skillId', select: 'name category slug icon' },
  ]);

  // Fetch all tasks, milestones, discussions, and resources concurrently
  const [tasks, milestones, discussions, resources] = await Promise.all([
    ProjectTask.find({ projectId })
      .populate('assigneeId', 'name email avatar')
      .populate('milestoneId', 'title status targetDate')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: 1 }),

    ProjectMilestone.find({ projectId })
      .populate('createdBy', 'name email avatar')
      .sort({ targetDate: 1, createdAt: 1 }),

    ProjectDiscussion.find({ projectId })
      .populate('authorId', 'name email avatar')
      .populate('replies.authorId', 'name email avatar')
      .sort({ pinned: -1, createdAt: -1 }),

    ProjectResource.find({ projectId })
      .populate('addedBy', 'name email avatar')
      .sort({ createdAt: -1 }),
  ]);

  // Compute Task & Project Progress metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === TASK_STATUSES.DONE).length;
  const inProgressTasks = tasks.filter((t) => t.status === TASK_STATUSES.IN_PROGRESS).length;
  const reviewTasks = tasks.filter((t) => t.status === TASK_STATUSES.REVIEW).length;
  const todoTasks = tasks.filter((t) => t.status === TASK_STATUSES.TODO).length;

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === MILESTONE_STATUSES.COMPLETED
  ).length;

  return {
    project,
    isCreator,
    userRole: memberRole,
    progress: {
      percentage: progressPercentage,
      totalTasks,
      completedTasks,
      inProgressTasks,
      reviewTasks,
      todoTasks,
      milestonesTotal: totalMilestones,
      milestonesCompleted: completedMilestones,
    },
    tasks,
    milestones,
    discussions,
    resources,
  };
};

// ==========================================
// TASKS OPERATIONS
// ==========================================

export const createTask = async (projectId, userId, taskData) => {
  const { project } = await verifyProjectMembership(projectId, userId);

  // Validate assignee if provided
  let assigneeId = null;
  if (taskData.assigneeId) {
    const isAssigneeCreator =
      project.creatorId.toString() === taskData.assigneeId.toString();
    const isAssigneeMember = project.members.some(
      (m) =>
        m.userId.toString() === taskData.assigneeId.toString() &&
        m.status === 'ACTIVE'
    );

    if (!isAssigneeCreator && !isAssigneeMember) {
      throw new AppError(
        'Assigned user must be an active project collaborator or creator.',
        400
      );
    }
    assigneeId = taskData.assigneeId;
  }

  // Get max order in the targeted status column
  const targetStatus = taskData.status || TASK_STATUSES.TODO;
  const lastTask = await ProjectTask.findOne({
    projectId,
    status: targetStatus,
  }).sort({ order: -1 });

  const order = lastTask ? lastTask.order + 1 : 0;

  const task = new ProjectTask({
    projectId,
    title: taskData.title.trim(),
    description: taskData.description ? taskData.description.trim() : '',
    status: targetStatus,
    priority: taskData.priority || TASK_PRIORITIES.MEDIUM,
    assigneeId,
    dueDate: taskData.dueDate || null,
    milestoneId: taskData.milestoneId || null,
    order,
    createdBy: userId,
  });

  await task.save();

  return await ProjectTask.findById(task._id)
    .populate('assigneeId', 'name email avatar')
    .populate('milestoneId', 'title status targetDate')
    .populate('createdBy', 'name email avatar');
};

export const updateTask = async (projectId, taskId, userId, updateData) => {
  const { project } = await verifyProjectMembership(projectId, userId);

  const task = await ProjectTask.findOne({ _id: taskId, projectId });
  if (!task) {
    throw new AppError('Task not found in this project.', 404);
  }

  if (updateData.title !== undefined) {
    task.title = updateData.title.trim();
  }
  if (updateData.description !== undefined) {
    task.description = updateData.description.trim();
  }
  if (updateData.status !== undefined) {
    task.status = updateData.status;
  }
  if (updateData.priority !== undefined) {
    task.priority = updateData.priority;
  }
  if (updateData.dueDate !== undefined) {
    task.dueDate = updateData.dueDate || null;
  }
  if (updateData.milestoneId !== undefined) {
    task.milestoneId = updateData.milestoneId || null;
  }
  if (updateData.order !== undefined) {
    task.order = updateData.order;
  }

  if (updateData.assigneeId !== undefined) {
    if (updateData.assigneeId) {
      const isAssigneeCreator =
        project.creatorId.toString() === updateData.assigneeId.toString();
      const isAssigneeMember = project.members.some(
        (m) =>
          m.userId.toString() === updateData.assigneeId.toString() &&
          m.status === 'ACTIVE'
      );

      if (!isAssigneeCreator && !isAssigneeMember) {
        throw new AppError(
          'Assigned user must be an active project collaborator or creator.',
          400
        );
      }
      task.assigneeId = updateData.assigneeId;
    } else {
      task.assigneeId = null;
    }
  }

  await task.save();

  return await ProjectTask.findById(task._id)
    .populate('assigneeId', 'name email avatar')
    .populate('milestoneId', 'title status targetDate')
    .populate('createdBy', 'name email avatar');
};

export const updateTaskStatus = async (projectId, taskId, userId, status) => {
  await verifyProjectMembership(projectId, userId);

  if (!Object.values(TASK_STATUSES).includes(status)) {
    throw new AppError(`Invalid task status: ${status}`, 400);
  }

  const task = await ProjectTask.findOne({ _id: taskId, projectId });
  if (!task) {
    throw new AppError('Task not found in this project.', 404);
  }

  task.status = status;
  await task.save();

  return await ProjectTask.findById(task._id)
    .populate('assigneeId', 'name email avatar')
    .populate('milestoneId', 'title status targetDate')
    .populate('createdBy', 'name email avatar');
};

export const deleteTask = async (projectId, taskId, userId) => {
  const { isCreator } = await verifyProjectMembership(projectId, userId);

  const task = await ProjectTask.findOne({ _id: taskId, projectId });
  if (!task) {
    throw new AppError('Task not found in this project.', 404);
  }

  const isTaskCreator = task.createdBy.toString() === userId.toString();
  const isAssignee = task.assigneeId && task.assigneeId.toString() === userId.toString();

  if (!isCreator && !isTaskCreator && !isAssignee) {
    throw new AppError('Unauthorized to delete this task.', 403);
  }

  await ProjectTask.findByIdAndDelete(taskId);
  return { success: true, taskId };
};

// ==========================================
// MILESTONES OPERATIONS
// ==========================================

export const createMilestone = async (projectId, userId, data) => {
  await verifyProjectMembership(projectId, userId);

  const milestone = new ProjectMilestone({
    projectId,
    title: data.title.trim(),
    description: data.description ? data.description.trim() : '',
    targetDate: data.targetDate || null,
    status: data.status || MILESTONE_STATUSES.PLANNED,
    completedAt: data.status === MILESTONE_STATUSES.COMPLETED ? new Date() : null,
    createdBy: userId,
  });

  await milestone.save();

  return await ProjectMilestone.findById(milestone._id).populate(
    'createdBy',
    'name email avatar'
  );
};

export const updateMilestone = async (projectId, milestoneId, userId, data) => {
  await verifyProjectMembership(projectId, userId);

  const milestone = await ProjectMilestone.findOne({ _id: milestoneId, projectId });
  if (!milestone) {
    throw new AppError('Milestone not found in this project.', 404);
  }

  if (data.title !== undefined) milestone.title = data.title.trim();
  if (data.description !== undefined) milestone.description = data.description.trim();
  if (data.targetDate !== undefined) milestone.targetDate = data.targetDate || null;

  if (data.status !== undefined) {
    milestone.status = data.status;
    if (data.status === MILESTONE_STATUSES.COMPLETED && !milestone.completedAt) {
      milestone.completedAt = new Date();
    } else if (data.status !== MILESTONE_STATUSES.COMPLETED) {
      milestone.completedAt = null;
    }
  }

  await milestone.save();

  return await ProjectMilestone.findById(milestone._id).populate(
    'createdBy',
    'name email avatar'
  );
};

export const deleteMilestone = async (projectId, milestoneId, userId) => {
  const { isCreator } = await verifyProjectMembership(projectId, userId);

  const milestone = await ProjectMilestone.findOne({ _id: milestoneId, projectId });
  if (!milestone) {
    throw new AppError('Milestone not found in this project.', 404);
  }

  if (!isCreator && milestone.createdBy.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to delete this milestone.', 403);
  }

  // Clear milestone reference on associated tasks
  await ProjectTask.updateMany({ milestoneId }, { milestoneId: null });

  await ProjectMilestone.findByIdAndDelete(milestoneId);
  return { success: true, milestoneId };
};

// ==========================================
// DISCUSSIONS OPERATIONS
// ==========================================

export const createDiscussion = async (projectId, userId, data) => {
  const { isCreator } = await verifyProjectMembership(projectId, userId);

  const discussion = new ProjectDiscussion({
    projectId,
    authorId: userId,
    title: data.title.trim(),
    message: data.message.trim(),
    category: data.category || 'GENERAL',
    pinned: isCreator ? !!data.pinned : false,
    replies: [],
  });

  await discussion.save();

  return await ProjectDiscussion.findById(discussion._id)
    .populate('authorId', 'name email avatar')
    .populate('replies.authorId', 'name email avatar');
};

export const addDiscussionReply = async (projectId, discussionId, userId, { message }) => {
  await verifyProjectMembership(projectId, userId);

  const discussion = await ProjectDiscussion.findOne({ _id: discussionId, projectId });
  if (!discussion) {
    throw new AppError('Discussion thread not found.', 404);
  }

  discussion.replies.push({
    authorId: userId,
    message: message.trim(),
    createdAt: new Date(),
  });

  await discussion.save();

  return await ProjectDiscussion.findById(discussion._id)
    .populate('authorId', 'name email avatar')
    .populate('replies.authorId', 'name email avatar');
};

export const deleteDiscussion = async (projectId, discussionId, userId) => {
  const { isCreator } = await verifyProjectMembership(projectId, userId);

  const discussion = await ProjectDiscussion.findOne({ _id: discussionId, projectId });
  if (!discussion) {
    throw new AppError('Discussion thread not found.', 404);
  }

  if (!isCreator && discussion.authorId.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to delete this discussion.', 403);
  }

  await ProjectDiscussion.findByIdAndDelete(discussionId);
  return { success: true, discussionId };
};

// ==========================================
// RESOURCES OPERATIONS
// ==========================================

export const addResource = async (projectId, userId, data) => {
  await verifyProjectMembership(projectId, userId);

  const resource = new ProjectResource({
    projectId,
    title: data.title.trim(),
    url: data.url.trim(),
    type: data.type || 'DOCUMENTATION',
    description: data.description ? data.description.trim() : '',
    addedBy: userId,
  });

  await resource.save();

  return await ProjectResource.findById(resource._id).populate(
    'addedBy',
    'name email avatar'
  );
};

export const deleteResource = async (projectId, resourceId, userId) => {
  const { isCreator } = await verifyProjectMembership(projectId, userId);

  const resource = await ProjectResource.findOne({ _id: resourceId, projectId });
  if (!resource) {
    throw new AppError('Resource not found in this project.', 404);
  }

  if (!isCreator && resource.addedBy.toString() !== userId.toString()) {
    throw new AppError('Unauthorized to delete this resource.', 403);
  }

  await ProjectResource.findByIdAndDelete(resourceId);
  return { success: true, resourceId };
};

// ==========================================
// WORKSPACE SETTINGS, LINKS & STATUS
// ==========================================

export const updateWorkspaceSettings = async (projectId, userId, settings) => {
  const { project, isCreator } = await verifyProjectMembership(projectId, userId);

  if (!isCreator) {
    throw new AppError('Only the project creator can update workspace settings.', 403);
  }

  if (settings.githubUrl !== undefined) {
    project.githubUrl = settings.githubUrl.trim();
  }
  if (settings.demoUrl !== undefined) {
    project.demoUrl = settings.demoUrl.trim();
  }
  if (settings.status !== undefined) {
    if (!Object.values(PROJECT_STATUSES).includes(settings.status)) {
      throw new AppError(`Invalid project status: ${settings.status}`, 400);
    }
    project.status = settings.status;
  }

  await project.save();

  return await Project.findById(project._id)
    .populate('creatorId', 'name email avatar')
    .populate('members.userId', 'name email avatar')
    .populate('requiredSkills.skillId', 'name category slug icon');
};

// ==========================================
// SKILL EVIDENCE ON PROJECT COMPLETION
// ==========================================

/**
 * When a project is completed, team members/creator can add this project
 * as verified evidence for the skills utilized in the project.
 */
export const addProjectToSkillEvidence = async (projectId, userId, payload = {}) => {
  const { project, memberRole } = await verifyProjectMembership(projectId, userId);

  if (project.status !== PROJECT_STATUSES.COMPLETED) {
    throw new AppError(
      'Skill evidence can only be claimed once the project status is COMPLETED.',
      400
    );
  }

  // Determine skills to attach evidence for:
  // Either user specifically picked skillNames, or default to all project required skills
  let targetSkillNames = [];
  if (Array.isArray(payload.skillNames) && payload.skillNames.length > 0) {
    targetSkillNames = payload.skillNames;
  } else if (Array.isArray(payload.skillIds) && payload.skillIds.length > 0) {
    const skills = await Skill.find({ _id: { $in: payload.skillIds } });
    targetSkillNames = skills.map((s) => s.name);
  } else {
    targetSkillNames = project.requiredSkills.map((s) => s.name);
  }

  if (targetSkillNames.length === 0) {
    throw new AppError('No matching skills found to attach evidence to.', 400);
  }

  const attachedResults = [];

  for (const skillName of targetSkillNames) {
    // Look up canonical skill
    let canonicalSkill = await Skill.findOne({
      name: { $regex: new RegExp(`^${skillName.trim()}$`, 'i') },
    });

    if (!canonicalSkill) {
      // Find fallback or create minimal canonical entry
      canonicalSkill = await Skill.findOne();
      if (!canonicalSkill) continue;
    }

    // Find or create UserSkill with intent TEACH
    let userSkill = await UserSkill.findOne({
      userId,
      skillId: canonicalSkill._id,
      type: SKILL_INTENTS.TEACH,
    });

    if (!userSkill) {
      userSkill = new UserSkill({
        userId,
        skillId: canonicalSkill._id,
        type: SKILL_INTENTS.TEACH,
        level: SKILL_LEVELS.INTERMEDIATE,
        yearsExperience: 1,
        isVerified: true,
        evidence: [],
      });
    }

    // Check if evidence for this project already exists
    const existingEvidenceIndex = userSkill.evidence.findIndex(
      (e) => e.projectName.toLowerCase() === project.title.toLowerCase()
    );

    const evidenceItem = {
      projectName: project.title,
      role: (payload.role || memberRole || 'Project Collaborator').trim(),
      description: (
        payload.description ||
        `Contributed to ${project.title}. Stack utilized: ${targetSkillNames.join(
          ', '
        )}. Project completed on SkillForge.`
      ).trim(),
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      verifiedAt: new Date(),
    };

    if (existingEvidenceIndex >= 0) {
      userSkill.evidence[existingEvidenceIndex] = evidenceItem;
    } else {
      userSkill.evidence.push(evidenceItem);
    }

    userSkill.isVerified = true;
    await userSkill.save();

    attachedResults.push({
      skillName: canonicalSkill.name,
      userSkillId: userSkill._id,
      isVerified: userSkill.isVerified,
      evidence: evidenceItem,
    });
  }

  return {
    projectTitle: project.title,
    attachedSkillsCount: attachedResults.length,
    skills: attachedResults,
  };
};

export default {
  verifyProjectMembership,
  getWorkspace,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  createDiscussion,
  addDiscussionReply,
  deleteDiscussion,
  addResource,
  deleteResource,
  updateWorkspaceSettings,
  addProjectToSkillEvidence,
};
