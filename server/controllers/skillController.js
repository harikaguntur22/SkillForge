import * as skillService from '../services/skillService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getSkills = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const skills = await skillService.getCanonicalSkills({ search, category });
    return sendSuccess(res, 200, { skills }, 'Skills fetched successfully.');
  } catch (error) {
    next(error);
  }
};

export const createSkill = async (req, res, next) => {
  try {
    const skill = await skillService.createCanonicalSkill(req.body, req.user?._id);
    return sendSuccess(res, 201, { skill }, 'Skill created successfully.');
  } catch (error) {
    next(error);
  }
};
