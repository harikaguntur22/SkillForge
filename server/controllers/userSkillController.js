import * as skillService from '../services/skillService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getUserSkills = async (req, res, next) => {
  try {
    const skills = await skillService.getUserSkills(req.user._id);
    return sendSuccess(res, 200, skills, 'User skills fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const addUserSkill = async (req, res, next) => {
  try {
    const userSkill = await skillService.addUserSkill(req.user._id, req.body);
    return sendSuccess(res, 201, { userSkill }, 'Skill successfully added to profile.');
  } catch (error) {
    next(error);
  }
};

export const updateUserSkill = async (req, res, next) => {
  try {
    const updated = await skillService.updateUserSkill(req.user._id, req.params.id, req.body);
    return sendSuccess(res, 200, { userSkill: updated }, 'Skill level updated successfully.');
  } catch (error) {
    next(error);
  }
};

export const deleteUserSkill = async (req, res, next) => {
  try {
    const result = await skillService.deleteUserSkill(req.user._id, req.params.id);
    return sendSuccess(res, 200, result, 'Skill removed from profile.');
  } catch (error) {
    next(error);
  }
};

export const addEvidence = async (req, res, next) => {
  try {
    const updated = await skillService.addEvidence(req.user._id, req.params.id, req.body);
    return sendSuccess(res, 201, { userSkill: updated }, 'Project evidence successfully attached to skill.');
  } catch (error) {
    next(error);
  }
};

export const deleteEvidence = async (req, res, next) => {
  try {
    const updated = await skillService.deleteEvidence(
      req.user._id,
      req.params.id,
      req.params.evidenceId
    );
    return sendSuccess(res, 200, { userSkill: updated }, 'Evidence item removed.');
  } catch (error) {
    next(error);
  }
};
