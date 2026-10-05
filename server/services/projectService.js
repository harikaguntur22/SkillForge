import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { UserSkill } from '../models/UserSkill.js';
import { ROLES } from '../config/constants.js';
import { rankProjectsForUser } from './projectRecommendationEngine.js';

export const getProjects = async (queryParams = {}, currentUserId = null) => {
  const {
    search,
    category,
    difficulty,
    skill,
    teamSize,
    creator,
    status,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = queryParams;

  const filter = {};

  // Category filter
  if (category && category !== 'ALL') {
    filter.category = category;
  }

  // Difficulty filter
  if (difficulty && difficulty !== 'ALL') {
    filter.difficulty = difficulty;
  }

  // Status filter
  if (status && status !== 'ALL') {
    filter.status = status;
  }

  // Creator filter ('me' or specific ID)
  if (creator === 'me' && currentUserId) {
    filter.creatorId = currentUserId;
  } else if (creator && creator !== 'me') {
    filter.creatorId = creator;
  }

  // Team size filter
  if (teamSize) {
    filter.teamSize = parseInt(teamSize, 10);
  }

  // Skill filter (by name or ID)
  if (skill) {
    filter.$or = [
      { 'requiredSkills.name': { $regex: new RegExp(skill, 'i') } },
      { 'requiredSkills.skillId': skill },
    ];
  }

  // Search filter
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const searchConditions = [
      { title: { $regex: searchRegex } },
      { tagline: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { tags: { $in: [searchRegex] } },
      { 'requiredSkills.name': { $regex: searchRegex } },
    ];

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
      delete filter.$or;
    } else {
      filter.$or = searchConditions;
    }
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'title') {
    sortOption = { title: 1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [total, projects] = await Promise.all([
    Project.countDocuments(filter),
    Project.find(filter)
      .populate('creatorId', 'name email college profileImage targetRole')
      .populate('requiredSkills.skillId', 'name category description')
      .populate('members.userId', 'name email college profileImage targetRole')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  return {
    projects,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate('creatorId', 'name email college branch graduationYear profileImage targetRole github bio')
    .populate('requiredSkills.skillId', 'name category description')
    .populate('members.userId', 'name email college branch graduationYear profileImage targetRole github bio')
    .lean();

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

export const createProject = async (projectData, creatorId) => {
  const members = projectData.members || [];
  if (!members.some((m) => m.userId?.toString() === creatorId.toString())) {
    members.unshift({
      userId: creatorId,
      role: 'Project Lead',
      joinedAt: new Date(),
      status: 'ACTIVE',
    });
  }

  const project = new Project({
    ...projectData,
    creatorId,
    members,
  });

  await project.save();

  return await Project.findById(project._id)
    .populate('creatorId', 'name email college profileImage targetRole')
    .populate('requiredSkills.skillId', 'name category description')
    .populate('members.userId', 'name email college profileImage targetRole')
    .lean();
};

export const updateProject = async (id, updateData, userId, userRole) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification: creator or admin
  const isCreator = project.creatorId.toString() === userId.toString();
  const isAdmin = userRole === ROLES.ADMIN;

  if (!isCreator && !isAdmin) {
    const error = new Error('You do not have permission to modify this project.');
    error.statusCode = 403;
    throw error;
  }

  // Apply updates
  Object.keys(updateData).forEach((field) => {
    if (field !== '_id' && field !== 'creatorId' && field !== 'createdAt') {
      project[field] = updateData[field];
    }
  });

  await project.save();

  return await Project.findById(project._id)
    .populate('creatorId', 'name email college profileImage targetRole')
    .populate('requiredSkills.skillId', 'name category description')
    .lean();
};

export const deleteProject = async (id, userId, userRole) => {
  const project = await Project.findById(id);

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Ownership verification: creator or admin
  const isCreator = project.creatorId.toString() === userId.toString();
  const isAdmin = userRole === ROLES.ADMIN;

  if (!isCreator && !isAdmin) {
    const error = new Error('You do not have permission to delete this project.');
    error.statusCode = 403;
    throw error;
  }

  await Project.findByIdAndDelete(id);

  return { message: 'Project deleted successfully.' };
};

export const getRecommendedProjects = async (userId, queryParams = {}) => {
  const {
    category,
    difficulty,
    readinessStatus,
    minScore,
    limit = 20,
  } = queryParams;

  const user = await User.findById(userId).lean();
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const userSkills = await UserSkill.find({ userId })
    .populate('skillId', 'name category description')
    .lean();

  // Fetch active projects that are open for collaboration or planning
  const projectFilter = {
    status: { $in: ['OPEN', 'PLANNING', 'IN_PROGRESS'] },
  };

  if (category && category !== 'ALL') {
    projectFilter.category = category;
  }
  if (difficulty && difficulty !== 'ALL') {
    projectFilter.difficulty = difficulty;
  }

  const projects = await Project.find(projectFilter)
    .populate('creatorId', 'name email college profileImage targetRole')
    .populate('requiredSkills.skillId', 'name category description')
    .lean();

  let allRecommendations = rankProjectsForUser(user, userSkills, projects);

  // Compute stats across all evaluated projects before filtering
  const stats = {
    totalProjectsEvaluated: projects.length,
    readyToBuildCount: allRecommendations.filter((r) => r.readinessStatus === 'READY_TO_BUILD').length,
    needsPreparationCount: allRecommendations.filter((r) => r.readinessStatus === 'NEEDS_PREPARATION').length,
    stretchProjectCount: allRecommendations.filter((r) => r.readinessStatus === 'STRETCH_PROJECT').length,
    topMatchScore: allRecommendations.length > 0 ? allRecommendations[0].score : 0,
  };

  let filteredRecommendations = allRecommendations;

  // Filter by readinessStatus if specified
  if (readinessStatus && readinessStatus !== 'ALL') {
    filteredRecommendations = filteredRecommendations.filter(
      (rec) => rec.readinessStatus === readinessStatus || rec.status === readinessStatus
    );
  }

  // Filter by minimum score if specified
  if (minScore) {
    const min = parseInt(minScore, 10);
    if (!isNaN(min)) {
      filteredRecommendations = filteredRecommendations.filter((rec) => rec.score >= min);
    }
  }

  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const paginatedRecommendations = filteredRecommendations.slice(0, limitNum);

  return {
    recommendations: paginatedRecommendations,
    stats,
    userProfile: {
      id: user._id,
      name: user.name,
      targetRole: user.targetRole,
      interests: user.interests,
      teachSkillsCount: userSkills.filter((s) => s.type === 'TEACH').length,
    },
  };
};
