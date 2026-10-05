import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { UserSkill } from '../models/UserSkill.js';
import { ProjectCollaboration } from '../models/ProjectCollaboration.js';
import {
  COLLABORATION_TYPES,
  COLLABORATION_STATUSES,
  COLLABORATION_ACTIONS,
  ROLES,
} from '../config/constants.js';
import { recommendCollaboratorsForProject } from './collaboratorRecommendationEngine.js';

/**
 * Gets recommended collaborators for open roles in a project.
 */
export const getRecommendedCollaborators = async (projectId, currentUserId, queryParams = {}) => {
  const { role } = queryParams;

  const project = await Project.findById(projectId)
    .populate('creatorId', 'name email college')
    .populate('members.userId', 'name email college profileImage targetRole')
    .lean();

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Load all students except the creator and current members
  const activeMemberIds = (project.members || [])
    .filter((m) => m.status === 'ACTIVE')
    .map((m) => (m.userId?._id || m.userId).toString());
  activeMemberIds.push((project.creatorId?._id || project.creatorId).toString());

  const candidates = await User.find({
    _id: { $nin: activeMemberIds },
    role: ROLES.STUDENT,
    isActive: true,
  }).lean();

  const candidateIds = candidates.map((c) => c._id);
  const userSkills = await UserSkill.find({
    userId: { $in: candidateIds },
  })
    .populate('skillId', 'name category')
    .lean();

  const candidateSkillMap = new Map();
  userSkills.forEach((us) => {
    const uId = us.userId.toString();
    if (!candidateSkillMap.has(uId)) {
      candidateSkillMap.set(uId, []);
    }
    candidateSkillMap.get(uId).push(us);
  });

  const recommendations = recommendCollaboratorsForProject(
    project,
    candidates,
    candidateSkillMap,
    role
  );

  return {
    project: {
      _id: project._id,
      title: project.title,
      category: project.category,
      difficulty: project.difficulty,
      teamSize: project.teamSize,
      activeMembersCount: (project.members || []).filter((m) => m.status === 'ACTIVE').length + 1,
    },
    roleRecommendations: recommendations,
  };
};

/**
 * Project Creator invites a student to join the team for a specific role.
 */
export const inviteCollaborator = async (projectId, creatorId, { candidateUserId, role, message = '' }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Verify ownership
  if (project.creatorId.toString() !== creatorId.toString()) {
    const error = new Error('Only the project creator can invite collaborators.');
    error.statusCode = 403;
    throw error;
  }

  // Verify team capacity
  const activeMembersCount = (project.members || []).filter((m) => m.status === 'ACTIVE').length;
  // Account for creator if not in members
  const isCreatorInMembers = (project.members || []).some(
    (m) => m.userId.toString() === creatorId.toString() && m.status === 'ACTIVE'
  );
  const totalOccupied = activeMembersCount + (isCreatorInMembers ? 0 : 1);

  if (totalOccupied >= project.teamSize) {
    const error = new Error(`Project team is already full (${project.teamSize} members).`);
    error.statusCode = 400;
    throw error;
  }

  // Verify candidate exists
  const candidate = await User.findById(candidateUserId);
  if (!candidate) {
    const error = new Error('Candidate user not found.');
    error.statusCode = 404;
    throw error;
  }

  // Cannot invite creator
  if (candidateUserId.toString() === creatorId.toString()) {
    const error = new Error('You cannot invite yourself to your own project.');
    error.statusCode = 400;
    throw error;
  }

  // Verify candidate is not already an active member
  const alreadyMember = (project.members || []).some(
    (m) => m.userId.toString() === candidateUserId.toString() && m.status === 'ACTIVE'
  );
  if (alreadyMember) {
    const error = new Error('This user is already an active member of this project.');
    error.statusCode = 400;
    throw error;
  }

  // Check for existing pending request or invite
  const existingPending = await ProjectCollaboration.findOne({
    projectId,
    receiverId: candidateUserId,
    status: COLLABORATION_STATUSES.PENDING,
  });

  if (existingPending) {
    const error = new Error('A pending collaboration invitation has already been sent to this user.');
    error.statusCode = 409;
    throw error;
  }

  const invite = new ProjectCollaboration({
    projectId,
    senderId: creatorId,
    receiverId: candidateUserId,
    type: COLLABORATION_TYPES.INVITE,
    role: role || 'Collaborator',
    message: message.trim(),
    status: COLLABORATION_STATUSES.PENDING,
  });

  await invite.save();

  return await ProjectCollaboration.findById(invite._id)
    .populate('projectId', 'title category teamSize')
    .populate('senderId', 'name email college profileImage')
    .populate('receiverId', 'name email college profileImage targetRole')
    .lean();
};

/**
 * A student requests to join an open project for a specific role.
 */
export const requestToJoinProject = async (projectId, applicantUserId, { role, message = '' }) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Cannot join own project
  if (project.creatorId.toString() === applicantUserId.toString()) {
    const error = new Error('You are the creator of this project.');
    error.statusCode = 400;
    throw error;
  }

  // Check team capacity
  const activeMembersCount = (project.members || []).filter((m) => m.status === 'ACTIVE').length;
  const isCreatorInMembers = (project.members || []).some(
    (m) => m.userId.toString() === project.creatorId.toString() && m.status === 'ACTIVE'
  );
  const totalOccupied = activeMembersCount + (isCreatorInMembers ? 0 : 1);

  if (totalOccupied >= project.teamSize) {
    const error = new Error('Project team is full.');
    error.statusCode = 400;
    throw error;
  }

  // Check if applicant is already a member
  const alreadyMember = (project.members || []).some(
    (m) => m.userId.toString() === applicantUserId.toString() && m.status === 'ACTIVE'
  );
  if (alreadyMember) {
    const error = new Error('You are already an active member of this project.');
    error.statusCode = 400;
    throw error;
  }

  // Check for existing pending join request
  const existingRequest = await ProjectCollaboration.findOne({
    projectId,
    senderId: applicantUserId,
    status: COLLABORATION_STATUSES.PENDING,
  });

  if (existingRequest) {
    const error = new Error('You already have a pending join request for this project.');
    error.statusCode = 409;
    throw error;
  }

  const joinRequest = new ProjectCollaboration({
    projectId,
    senderId: applicantUserId,
    receiverId: project.creatorId,
    type: COLLABORATION_TYPES.JOIN_REQUEST,
    role: role || 'Collaborator',
    message: message.trim(),
    status: COLLABORATION_STATUSES.PENDING,
  });

  await joinRequest.save();

  return await ProjectCollaboration.findById(joinRequest._id)
    .populate('projectId', 'title category teamSize')
    .populate('senderId', 'name email college profileImage')
    .populate('receiverId', 'name email college profileImage')
    .lean();
};

/**
 * Responds to a collaboration request (Accept or Reject).
 */
export const respondToCollaborationRequest = async (
  requestId,
  currentUserId,
  { action, responseMessage = '' }
) => {
  const request = await ProjectCollaboration.findById(requestId);
  if (!request) {
    const error = new Error('Collaboration request not found.');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== COLLABORATION_STATUSES.PENDING) {
    const error = new Error(`Request has already been ${request.status.toLowerCase()}.`);
    error.statusCode = 400;
    throw error;
  }

  // Authorization check: receiver must be current user
  if (request.receiverId.toString() !== currentUserId.toString()) {
    const error = new Error('You do not have authorization to respond to this request.');
    error.statusCode = 403;
    throw error;
  }

  const project = await Project.findById(request.projectId);
  if (!project) {
    const error = new Error('Associated project was not found.');
    error.statusCode = 404;
    throw error;
  }

  if (action === COLLABORATION_ACTIONS.ACCEPT) {
    // Determine who is joining the team:
    // If INVITE: receiver is joining
    // If JOIN_REQUEST: sender is joining
    const userToJoinId =
      request.type === COLLABORATION_TYPES.INVITE ? request.receiverId : request.senderId;

    // Check capacity
    const activeMembersCount = (project.members || []).filter((m) => m.status === 'ACTIVE').length;
    const isCreatorInMembers = (project.members || []).some(
      (m) => m.userId.toString() === project.creatorId.toString() && m.status === 'ACTIVE'
    );
    const totalOccupied = activeMembersCount + (isCreatorInMembers ? 0 : 1);

    if (totalOccupied >= project.teamSize) {
      const error = new Error('Project team capacity has been reached.');
      error.statusCode = 400;
      throw error;
    }

    // Ensure creator is also recorded in members if not already
    if (!isCreatorInMembers) {
      project.members.push({
        userId: project.creatorId,
        role: 'Project Lead',
        joinedAt: project.createdAt || new Date(),
        status: 'ACTIVE',
      });
    }

    // Add member or reactivate if previously left
    const existingMemberIndex = (project.members || []).findIndex(
      (m) => m.userId.toString() === userToJoinId.toString()
    );

    if (existingMemberIndex >= 0) {
      project.members[existingMemberIndex].status = 'ACTIVE';
      project.members[existingMemberIndex].role = request.role;
      project.members[existingMemberIndex].joinedAt = new Date();
    } else {
      project.members.push({
        userId: userToJoinId,
        role: request.role,
        joinedAt: new Date(),
        status: 'ACTIVE',
      });
    }

    // Increment role filled counter if role exists in requiredRoles
    if (project.requiredRoles && project.requiredRoles.length > 0) {
      const roleDef = project.requiredRoles.find(
        (r) => r.roleName.toLowerCase() === request.role.toLowerCase()
      );
      if (roleDef) {
        roleDef.filled = (roleDef.filled || 0) + 1;
      }
    }

    await project.save();

    request.status = COLLABORATION_STATUSES.ACCEPTED;
    request.responseMessage = responseMessage.trim();
    request.respondedAt = new Date();
    await request.save();
  } else if (action === COLLABORATION_ACTIONS.REJECT) {
    request.status = COLLABORATION_STATUSES.REJECTED;
    request.responseMessage = responseMessage.trim();
    request.respondedAt = new Date();
    await request.save();
  } else {
    const error = new Error("Invalid action. Must be 'ACCEPT' or 'REJECT'.");
    error.statusCode = 400;
    throw error;
  }

  return await ProjectCollaboration.findById(request._id)
    .populate('projectId', 'title category teamSize members')
    .populate('senderId', 'name email college profileImage')
    .populate('receiverId', 'name email college profileImage')
    .lean();
};

/**
 * Cancels a pending collaboration request sent by the current user.
 */
export const cancelCollaborationRequest = async (requestId, currentUserId) => {
  const request = await ProjectCollaboration.findById(requestId);
  if (!request) {
    const error = new Error('Collaboration request not found.');
    error.statusCode = 404;
    throw error;
  }

  if (request.senderId.toString() !== currentUserId.toString()) {
    const error = new Error('You can only cancel requests you sent.');
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== COLLABORATION_STATUSES.PENDING) {
    const error = new Error(`Cannot cancel a request that is already ${request.status.toLowerCase()}.`);
    error.statusCode = 400;
    throw error;
  }

  request.status = COLLABORATION_STATUSES.CANCELLED;
  request.respondedAt = new Date();
  await request.save();

  return { message: 'Collaboration request cancelled successfully.' };
};

/**
 * Gets requests and invites associated with a project (for the project creator/team).
 */
export const getProjectCollaborationRequests = async (projectId, currentUserId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  const isCreator = project.creatorId.toString() === currentUserId.toString();
  const isMember = (project.members || []).some(
    (m) => m.userId.toString() === currentUserId.toString() && m.status === 'ACTIVE'
  );

  if (!isCreator && !isMember) {
    const error = new Error('You must be a team member or creator to view project collaboration requests.');
    error.statusCode = 403;
    throw error;
  }

  const requests = await ProjectCollaboration.find({ projectId })
    .populate('senderId', 'name email college profileImage targetRole')
    .populate('receiverId', 'name email college profileImage targetRole')
    .sort({ createdAt: -1 })
    .lean();

  return requests;
};

/**
 * Gets all collaboration requests involving the current student (invites received and applications sent).
 */
export const getMyCollaborationRequests = async (currentUserId, queryParams = {}) => {
  const { type, status } = queryParams;

  const filter = {
    $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
  };

  if (type) filter.type = type;
  if (status && status !== 'ALL') filter.status = status;

  const requests = await ProjectCollaboration.find(filter)
    .populate('projectId', 'title category difficulty estimatedDuration teamSize creatorId')
    .populate('senderId', 'name email college profileImage targetRole')
    .populate('receiverId', 'name email college profileImage targetRole')
    .sort({ createdAt: -1 })
    .lean();

  const invitesReceived = requests.filter(
    (r) => r.receiverId._id.toString() === currentUserId.toString() && r.type === COLLABORATION_TYPES.INVITE
  );
  const joinRequestsSent = requests.filter(
    (r) => r.senderId._id.toString() === currentUserId.toString() && r.type === COLLABORATION_TYPES.JOIN_REQUEST
  );
  const joinRequestsReceived = requests.filter(
    (r) => r.receiverId._id.toString() === currentUserId.toString() && r.type === COLLABORATION_TYPES.JOIN_REQUEST
  );

  return {
    all: requests,
    invitesReceived,
    joinRequestsSent,
    joinRequestsReceived,
  };
};

/**
 * Gets team members for a project.
 */
export const getProjectMembers = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('creatorId', 'name email college profileImage targetRole github bio')
    .populate('members.userId', 'name email college branch graduationYear profileImage targetRole github bio')
    .lean();

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Make sure creator is represented
  const members = (project.members || []).filter((m) => m.status === 'ACTIVE');
  const hasCreator = members.some(
    (m) => m.userId?._id?.toString() === project.creatorId?._id?.toString()
  );

  const team = [...members];
  if (!hasCreator && project.creatorId) {
    team.unshift({
      userId: project.creatorId,
      role: 'Project Lead',
      joinedAt: project.createdAt,
      status: 'ACTIVE',
      isCreator: true,
    });
  }

  return {
    projectId: project._id,
    title: project.title,
    teamSize: project.teamSize,
    requiredRoles: project.requiredRoles || [],
    members: team,
    availableSpots: Math.max(0, project.teamSize - team.length),
  };
};

/**
 * Updates a member's role in the project (Creator only).
 */
export const updateProjectMemberRole = async (projectId, creatorId, targetUserId, newRole) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.creatorId.toString() !== creatorId.toString()) {
    const error = new Error('Only the project creator can modify member roles.');
    error.statusCode = 403;
    throw error;
  }

  const member = (project.members || []).find(
    (m) => m.userId.toString() === targetUserId.toString() && m.status === 'ACTIVE'
  );

  if (!member) {
    const error = new Error('Active member not found in this project.');
    error.statusCode = 404;
    throw error;
  }

  member.role = newRole.trim();
  await project.save();

  return await getProjectMembers(projectId);
};

/**
 * Removes a member from the project team (Creator only).
 */
export const removeProjectMember = async (projectId, creatorId, targetUserId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.creatorId.toString() !== creatorId.toString()) {
    const error = new Error('Only the project creator can remove team members.');
    error.statusCode = 403;
    throw error;
  }

  if (targetUserId.toString() === creatorId.toString()) {
    const error = new Error('The project creator cannot be removed from the project.');
    error.statusCode = 400;
    throw error;
  }

  const memberIndex = (project.members || []).findIndex(
    (m) => m.userId.toString() === targetUserId.toString() && m.status === 'ACTIVE'
  );

  if (memberIndex === -1) {
    const error = new Error('Active member not found in this project.');
    error.statusCode = 404;
    throw error;
  }

  const removedRole = project.members[memberIndex].role;
  project.members[memberIndex].status = 'REMOVED';

  // Decrement filled count in requiredRoles if applicable
  if (project.requiredRoles && project.requiredRoles.length > 0) {
    const roleDef = project.requiredRoles.find(
      (r) => r.roleName.toLowerCase() === removedRole.toLowerCase()
    );
    if (roleDef && roleDef.filled > 0) {
      roleDef.filled -= 1;
    }
  }

  await project.save();

  return { message: 'Member removed successfully.', team: await getProjectMembers(projectId) };
};

/**
 * Member voluntarily leaves the project.
 */
export const leaveProject = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (project.creatorId.toString() === userId.toString()) {
    const error = new Error('As project creator, you cannot leave your own project. You may delete the project instead.');
    error.statusCode = 400;
    throw error;
  }

  const member = (project.members || []).find(
    (m) => m.userId.toString() === userId.toString() && m.status === 'ACTIVE'
  );

  if (!member) {
    const error = new Error('You are not an active member of this project.');
    error.statusCode = 404;
    throw error;
  }

  const leftRole = member.role;
  member.status = 'LEFT';

  // Decrement filled count in requiredRoles if applicable
  if (project.requiredRoles && project.requiredRoles.length > 0) {
    const roleDef = project.requiredRoles.find(
      (r) => r.roleName.toLowerCase() === leftRole.toLowerCase()
    );
    if (roleDef && roleDef.filled > 0) {
      roleDef.filled -= 1;
    }
  }

  await project.save();

  return { message: 'You have left the project team.' };
};
