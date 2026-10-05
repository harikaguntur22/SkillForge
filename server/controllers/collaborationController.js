import * as collaborationService from '../services/collaborationService.js';

export const getRecommendedCollaborators = async (req, res, next) => {
  try {
    const result = await collaborationService.getRecommendedCollaborators(
      req.params.id,
      req.user._id,
      req.query
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteCollaborator = async (req, res, next) => {
  try {
    const result = await collaborationService.inviteCollaborator(
      req.params.id,
      req.user._id,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Collaborator invitation sent successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const requestToJoinProject = async (req, res, next) => {
  try {
    const result = await collaborationService.requestToJoinProject(
      req.params.id,
      req.user._id,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Join request submitted successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToCollaborationRequest = async (req, res, next) => {
  try {
    const result = await collaborationService.respondToCollaborationRequest(
      req.params.id,
      req.user._id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: `Collaboration request ${result.status.toLowerCase()} successfully.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelCollaborationRequest = async (req, res, next) => {
  try {
    const result = await collaborationService.cancelCollaborationRequest(
      req.params.id,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectCollaborationRequests = async (req, res, next) => {
  try {
    const result = await collaborationService.getProjectCollaborationRequests(
      req.params.id,
      req.user._id
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCollaborationRequests = async (req, res, next) => {
  try {
    const result = await collaborationService.getMyCollaborationRequests(
      req.user._id,
      req.query
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectMembers = async (req, res, next) => {
  try {
    const result = await collaborationService.getProjectMembers(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectMemberRole = async (req, res, next) => {
  try {
    const result = await collaborationService.updateProjectMemberRole(
      req.params.id,
      req.user._id,
      req.params.userId,
      req.body.role
    );
    res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const result = await collaborationService.removeProjectMember(
      req.params.id,
      req.user._id,
      req.params.userId
    );
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.team,
    });
  } catch (error) {
    next(error);
  }
};

export const leaveProject = async (req, res, next) => {
  try {
    const result = await collaborationService.leaveProject(
      req.params.id,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
