import { Skill } from '../models/Skill.js';
import { UserSkill } from '../models/UserSkill.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { SKILL_LEVELS, SKILL_INTENTS } from '../config/constants.js';

// --- Canonical Skill Catalog ---

export const getCanonicalSkills = async ({ search, category }) => {
  const query = { isApproved: true };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search && search.trim() !== '') {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  return await Skill.find(query).sort({ name: 1 }).lean();
};

export const createCanonicalSkill = async (skillData, userId = null) => {
  const { name, category, description, icon } = skillData;

  const existing = await Skill.findOne({
    name: { $regex: `^${name.trim()}$`, $options: 'i' },
  });

  if (existing) {
    return existing;
  }

  const skill = new Skill({
    name: name.trim(),
    category,
    description: description || '',
    icon: icon || 'Code2',
    createdBy: userId,
  });

  await skill.save();
  return skill;
};

// --- User Skills & Intent Management ---

export const getUserSkills = async (userId) => {
  const userSkills = await UserSkill.find({ userId })
    .populate('skillId', 'name category slug icon description')
    .sort({ createdAt: -1 })
    .lean();

  const teach = userSkills.filter((item) => item.type === SKILL_INTENTS.TEACH);
  const learn = userSkills.filter((item) => item.type === SKILL_INTENTS.LEARN);

  return { teach, learn };
};

export const addUserSkill = async (userId, payload) => {
  const { skillId, skillName, category, type, level, yearsExperience } = payload;

  let targetSkillId = skillId;

  // If skillId is not directly provided, find or create by name
  if (!targetSkillId && skillName) {
    let skill = await Skill.findOne({
      name: { $regex: `^${skillName.trim()}$`, $options: 'i' },
    });

    if (!skill) {
      skill = await createCanonicalSkill(
        {
          name: skillName.trim(),
          category: category || 'Other',
        },
        userId
      );
    }
    targetSkillId = skill._id;
  }

  if (!targetSkillId) {
    throw new AppError('Skill ID or valid skill name is required.', 400);
  }

  // Check for duplicate intent
  const existingUserSkill = await UserSkill.findOne({
    userId,
    skillId: targetSkillId,
    type,
  });

  if (existingUserSkill) {
    throw new AppError(
      `You have already added this skill to your '${type}' list.`,
      409
    );
  }

  const newUserSkill = new UserSkill({
    userId,
    skillId: targetSkillId,
    type,
    level: level || (type === SKILL_INTENTS.TEACH ? SKILL_LEVELS.INTERMEDIATE : SKILL_LEVELS.BEGINNER),
    yearsExperience: type === SKILL_INTENTS.TEACH ? (yearsExperience || 1) : 0,
    isVerified: false,
    evidence: [],
  });

  await newUserSkill.save();
  return await UserSkill.findById(newUserSkill._id).populate('skillId', 'name category slug icon description');
};

export const updateUserSkill = async (userId, userSkillId, updateData) => {
  const userSkill = await UserSkill.findOne({ _id: userSkillId, userId });

  if (!userSkill) {
    throw new AppError('User skill not found or unauthorized to edit.', 404);
  }

  if (updateData.level) {
    userSkill.level = updateData.level;
  }

  if (updateData.yearsExperience !== undefined) {
    userSkill.yearsExperience = updateData.yearsExperience;
  }

  await userSkill.save();
  return await UserSkill.findById(userSkill._id).populate('skillId', 'name category slug icon description');
};

export const deleteUserSkill = async (userId, userSkillId) => {
  const userSkill = await UserSkill.findOneAndDelete({ _id: userSkillId, userId });

  if (!userSkill) {
    throw new AppError('User skill not found or unauthorized to delete.', 404);
  }

  return { success: true, deletedSkillId: userSkillId };
};

// --- Project Evidence for Skills ---

export const addEvidence = async (userId, userSkillId, evidenceData) => {
  const userSkill = await UserSkill.findOne({ _id: userSkillId, userId });

  if (!userSkill) {
    throw new AppError('Skill not found in your profile.', 404);
  }

  if (userSkill.type !== SKILL_INTENTS.TEACH) {
    throw new AppError('Project evidence can only be attached to skills you can teach.', 400);
  }

  const newEvidence = {
    projectName: evidenceData.projectName.trim(),
    role: evidenceData.role.trim(),
    description: evidenceData.description.trim(),
    githubUrl: evidenceData.githubUrl ? evidenceData.githubUrl.trim() : '',
    demoUrl: evidenceData.demoUrl ? evidenceData.demoUrl.trim() : '',
    verifiedAt: new Date(),
  };

  userSkill.evidence.push(newEvidence);
  userSkill.isVerified = true;

  await userSkill.save();
  return await UserSkill.findById(userSkill._id).populate('skillId', 'name category slug icon description');
};

export const deleteEvidence = async (userId, userSkillId, evidenceId) => {
  const userSkill = await UserSkill.findOne({ _id: userSkillId, userId });

  if (!userSkill) {
    throw new AppError('Skill not found in your profile.', 404);
  }

  const initialLength = userSkill.evidence.length;
  userSkill.evidence = userSkill.evidence.filter((item) => item._id.toString() !== evidenceId);

  if (userSkill.evidence.length === initialLength) {
    throw new AppError('Evidence entry not found.', 404);
  }

  userSkill.isVerified = userSkill.evidence.length > 0;
  await userSkill.save();

  return await UserSkill.findById(userSkill._id).populate('skillId', 'name category slug icon description');
};

// --- Public User Profile Fetch ---

export const getPublicProfile = async (targetUserId) => {
  const user = await User.findById(targetUserId).select('-passwordHash').lean();

  if (!user) {
    throw new AppError('User profile not found.', 404);
  }

  const userSkills = await UserSkill.find({ userId: targetUserId })
    .populate('skillId', 'name category slug icon description')
    .sort({ createdAt: -1 })
    .lean();

  const teach = userSkills.filter((item) => item.type === SKILL_INTENTS.TEACH);
  const learn = userSkills.filter((item) => item.type === SKILL_INTENTS.LEARN);

  return {
    user,
    skills: {
      teach,
      learn,
    },
  };
};
