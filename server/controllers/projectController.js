import * as projectService from '../services/projectService.js';

export const getProjects = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const result = await projectService.getProjects(req.query, currentUserId);
    res.status(200).json({
      success: true,
      data: result.projects,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const result = await projectService.getRecommendedProjects(userId, req.query);
    res.status(200).json({
      success: true,
      data: result.recommendations,
      stats: result.stats,
      userProfile: result.userProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(
      req.params.id,
      req.user._id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
