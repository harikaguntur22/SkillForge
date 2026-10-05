import { UserSkill } from '../models/UserSkill.js';
import { User } from '../models/User.js';
import { SkillSession } from '../models/SkillSession.js';
import { SkillExchangeRequest } from '../models/SkillExchangeRequest.js';
import { SKILL_INTENTS } from '../config/constants.js';

const LEVEL_WEIGHTS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

/**
 * Calculates bilateral compatibility between two users
 */
export const calculatePairCompatibility = (userAData, userBData, ratingB = 4.5) => {
  const { user: userA, teach: teachA, learn: learnA } = userAData;
  const { user: userB, teach: teachB, learn: learnB } = userBData;

  const matchReasons = [];

  // 1. What B can teach that A wants to learn (B -> A)
  const canLearnFromB = [];
  for (const lA of learnA) {
    const tB = teachB.find(
      (t) => t.skillId._id.toString() === lA.skillId._id.toString()
    );
    if (tB) {
      canLearnFromB.push({
        skill: tB.skillId,
        mentorLevel: tB.level,
        learnerLevel: lA.level,
      });
      matchReasons.push(
        `${userB.name} can teach you ${tB.skillId.name} (${tB.level.toLowerCase()} level)`
      );
    }
  }

  // 2. What A can teach that B wants to learn (A -> B)
  const canTeachB = [];
  for (const tA of teachA) {
    const lB = learnB.find(
      (l) => l.skillId._id.toString() === tA.skillId._id.toString()
    );
    if (lB) {
      canTeachB.push({
        skill: tA.skillId,
        userLevel: tA.level,
        peerLevel: lB.level,
      });
      matchReasons.push(
        `You can teach ${userB.name} ${tA.skillId.name} (${tA.level.toLowerCase()} level)`
      );
    }
  }

  // If there is zero skill overlap in either direction, no match
  if (canLearnFromB.length === 0 && canTeachB.length === 0) {
    return null;
  }

  let baseScore = 0;
  let matchType = 'MENTOR';

  if (canLearnFromB.length > 0 && canTeachB.length > 0) {
    // Bilateral Mutual Exchange
    matchType = 'MUTUAL';
    baseScore = 65 + Math.min(canLearnFromB.length + canTeachB.length, 3) * 5; // 70 - 80
  } else if (canLearnFromB.length > 0) {
    // Peer can mentor user
    matchType = 'MENTOR';
    baseScore = 45 + Math.min(canLearnFromB.length, 3) * 5; // 50 - 60
  } else {
    // User can mentor peer
    matchType = 'STUDENT';
    baseScore = 35 + Math.min(canTeachB.length, 3) * 5; // 40 - 50
  }

  // 3. College Proximity Boost
  let collegeBonus = 0;
  if (
    userA.college &&
    userB.college &&
    userA.college.toLowerCase().trim() === userB.college.toLowerCase().trim()
  ) {
    collegeBonus = 10;
    matchReasons.push(`Shared campus: Both attending ${userA.college}`);
  }

  // 4. Interests Overlap Boost
  let interestBonus = 0;
  const interestsA = userA.interests || [];
  const interestsB = userB.interests || [];
  const commonInterests = interestsA.filter((i) =>
    interestsB.some((j) => j.toLowerCase().trim() === i.toLowerCase().trim())
  );
  if (commonInterests.length > 0) {
    interestBonus = Math.min(commonInterests.length * 3, 8);
    matchReasons.push(`Common interests: ${commonInterests.slice(0, 2).join(', ')}`);
  }

  // 5. Ratings / Mentorship Quality Boost
  const ratingBonus = Math.round((ratingB / 5) * 5); // 0 - 5

  const totalScore = Math.min(
    Math.round(baseScore + collegeBonus + interestBonus + ratingBonus),
    99
  );

  return {
    peer: {
      _id: userB._id,
      name: userB.name,
      email: userB.email,
      profileImage: userB.profileImage,
      college: userB.college,
      branch: userB.branch,
      graduationYear: userB.graduationYear,
      targetRole: userB.targetRole,
      bio: userB.bio,
    },
    compatibilityScore: totalScore,
    matchType,
    matchReasons,
    canLearnFromPeer: canLearnFromB.map((c) => ({
      _id: c.skill._id,
      name: c.skill.name,
      level: c.mentorLevel,
    })),
    canTeachPeer: canTeachB.map((c) => ({
      _id: c.skill._id,
      name: c.skill.name,
      level: c.userLevel,
    })),
  };
};

/**
 * Finds all compatible peers for an authenticated user
 */
export const findMatchesForUser = async (currentUserId) => {
  // 1. Fetch current user with their skills
  const currentUser = await User.findById(currentUserId).lean();
  if (!currentUser) return [];

  const currentUserSkills = await UserSkill.find({ userId: currentUserId })
    .populate('skillId', 'name category slug icon')
    .lean();

  const userAData = {
    user: currentUser,
    teach: currentUserSkills.filter((s) => s.type === SKILL_INTENTS.TEACH),
    learn: currentUserSkills.filter((s) => s.type === SKILL_INTENTS.LEARN),
  };

  // 2. Fetch all other active users
  const otherUsers = await User.find({
    _id: { $ne: currentUserId },
    isActive: true,
  }).lean();

  if (otherUsers.length === 0) return [];

  // 3. Fetch all other user skills in a single indexed query
  const allOtherUserSkills = await UserSkill.find({
    userId: { $in: otherUsers.map((u) => u._id) },
  })
    .populate('skillId', 'name category slug icon')
    .lean();

  // Group skills by userId
  const skillsByUserId = {};
  for (const s of allOtherUserSkills) {
    const uId = s.userId.toString();
    if (!skillsByUserId[uId]) skillsByUserId[uId] = [];
    skillsByUserId[uId].push(s);
  }

  // 4. Fetch existing exchange requests between current user and other users
  const existingRequests = await SkillExchangeRequest.find({
    $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
  }).lean();

  const requestsMap = {};
  for (const r of existingRequests) {
    const otherId =
      r.senderId.toString() === currentUserId.toString()
        ? r.receiverId.toString()
        : r.senderId.toString();
    requestsMap[otherId] = {
      _id: r._id,
      status: r.status,
      isSender: r.senderId.toString() === currentUserId.toString(),
      message: r.message,
    };
  }

  // 5. Calculate scores for all peers
  const matches = [];
  for (const peer of otherUsers) {
    const peerSkills = skillsByUserId[peer._id.toString()] || [];
    const userBData = {
      user: peer,
      teach: peerSkills.filter((s) => s.type === SKILL_INTENTS.TEACH),
      learn: peerSkills.filter((s) => s.type === SKILL_INTENTS.LEARN),
    };

    const matchResult = calculatePairCompatibility(userAData, userBData);
    if (matchResult) {
      matchResult.existingRequest = requestsMap[peer._id.toString()] || null;
      matches.push(matchResult);
    }
  }

  // Sort by highest compatibility score first, then mutual matches
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return matches;
};
