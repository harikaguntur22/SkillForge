import { SKILL_LEVELS, PROJECT_DIFFICULTIES } from '../config/constants.js';

const LEVEL_WEIGHTS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

/**
 * Normalizes role skill requirements from role definition or role name keywords.
 */
export const extractSkillsForRole = (role, project) => {
  if (role.skills && role.skills.length > 0) {
    return role.skills;
  }

  const roleLower = (role.roleName || '').toLowerCase();
  const matchedSkills = [];

  // Match against project's required skills
  (project.requiredSkills || []).forEach((reqSkill) => {
    const sName = reqSkill.name.toLowerCase();
    if (
      roleLower.includes(sName) ||
      (roleLower.includes('frontend') && ['react', 'next.js', 'vue', 'tailwind css', 'typescript'].includes(sName)) ||
      (roleLower.includes('react') && ['react', 'tailwind css'].includes(sName)) ||
      (roleLower.includes('backend') && ['node.js', 'express.js', 'python', 'fastapi', 'mongodb', 'postgresql'].includes(sName)) ||
      (roleLower.includes('node') && ['node.js', 'express.js', 'mongodb'].includes(sName)) ||
      (roleLower.includes('ui') && ['tailwind css', 'react', 'figma'].includes(sName)) ||
      (roleLower.includes('designer') && ['tailwind css', 'react'].includes(sName)) ||
      (roleLower.includes('devops') && ['docker', 'kubernetes', 'linux', 'aws'].includes(sName)) ||
      (roleLower.includes('cloud') && ['docker', 'kubernetes', 'aws'].includes(sName)) ||
      (roleLower.includes('ai') && ['python', 'pytorch', 'langchain'].includes(sName)) ||
      (roleLower.includes('data') && ['python', 'pandas', 'postgresql'].includes(sName))
    ) {
      matchedSkills.push(reqSkill.name);
    }
  });

  if (matchedSkills.length > 0) {
    return [...new Set(matchedSkills)];
  }

  // Fallback to project required skill names if generic role
  return (project.requiredSkills || []).map((s) => s.name).slice(0, 3);
};

/**
 * Calculates compatibility score between a candidate student and a specific project role.
 */
export const calculateCandidateRoleScore = (candidate, candidateSkills = [], role, project) => {
  const teachSkills = candidateSkills.filter((s) => s.type === 'TEACH');
  const userSkillMap = new Map();
  teachSkills.forEach((us) => {
    const name = us.skillId?.name || us.name || '';
    if (name) {
      userSkillMap.set(name.toLowerCase(), {
        name,
        level: us.level || SKILL_LEVELS.INTERMEDIATE,
        isVerified: us.isVerified || false,
        evidence: us.evidence || [],
      });
    }
  });

  const roleSkills = extractSkillsForRole(role, project);

  // 1. Required Skill Match (Weight: 40%)
  const matchedSkills = [];
  const missingSkills = [];
  let totalSkillCredit = 0;

  if (roleSkills.length === 0) {
    totalSkillCredit = 1;
  } else {
    roleSkills.forEach((skillName) => {
      const userSkill = userSkillMap.get(skillName.toLowerCase());
      if (userSkill) {
        const userWeight = LEVEL_WEIGHTS[userSkill.level] || 2;
        totalSkillCredit += userWeight >= 2 ? 1.0 : 0.7;
        matchedSkills.push({
          name: userSkill.name,
          level: userSkill.level,
          isVerified: userSkill.isVerified,
          evidenceCount: (userSkill.evidence || []).length,
        });
      } else {
        missingSkills.push({
          name: skillName,
          requiredLevel: SKILL_LEVELS.INTERMEDIATE,
        });
      }
    });
  }

  const skillMatchRatio = roleSkills.length > 0 ? totalSkillCredit / roleSkills.length : 0.5;
  const skillScore = Math.min(40, Math.round(skillMatchRatio * 40 * 10) / 10);

  // 2. Interest / Domain Match (Weight: 20%)
  const candidateInterests = (candidate.interests || []).map((i) => i.toLowerCase());
  const projectCategory = (project.category || '').toLowerCase();
  let interestScore = 4;

  if (
    candidateInterests.some(
      (interest) =>
        interest.includes(projectCategory) ||
        projectCategory.includes(interest) ||
        (projectCategory.includes('web') && (interest.includes('frontend') || interest.includes('react') || interest.includes('ui'))) ||
        (projectCategory.includes('cloud') && interest.includes('devops')) ||
        (projectCategory.includes('ai') && interest.includes('machine learning'))
    )
  ) {
    interestScore = 15;
  } else if (
    teachSkills.some((s) => s.skillId?.category?.toLowerCase() === projectCategory)
  ) {
    interestScore = 12;
  }

  // Tag bonus
  const tags = (project.tags || []).map((t) => t.toLowerCase());
  tags.forEach((tag) => {
    if (candidateInterests.some((i) => i.includes(tag) || tag.includes(i))) {
      interestScore = Math.min(20, interestScore + 2.5);
    }
  });

  // 3. Difficulty Compatibility (Weight: 15%)
  let highestLevel = 1;
  teachSkills.forEach((s) => {
    const w = LEVEL_WEIGHTS[s.level] || 1;
    if (w > highestLevel) highestLevel = w;
  });

  const projDiff = project.difficulty || PROJECT_DIFFICULTIES.INTERMEDIATE;
  let difficultyScore = 10;
  if (highestLevel >= 3) {
    difficultyScore = projDiff === 'ADVANCED' ? 15 : 14;
  } else if (highestLevel === 2) {
    difficultyScore = projDiff === 'INTERMEDIATE' ? 15 : projDiff === 'BEGINNER' ? 13 : 9;
  } else {
    difficultyScore = projDiff === 'BEGINNER' ? 15 : 10;
  }

  // 4. Career Goal Match (Weight: 15%)
  const targetRole = (candidate.targetRole || '').toLowerCase();
  const roleNameLower = (role.roleName || '').toLowerCase();
  let careerGoalScore = 5;

  if (
    (targetRole.includes('frontend') || targetRole.includes('ui')) &&
    (roleNameLower.includes('react') || roleNameLower.includes('frontend') || roleNameLower.includes('ui') || roleNameLower.includes('designer'))
  ) {
    careerGoalScore = 15;
  } else if (
    (targetRole.includes('backend') || targetRole.includes('full stack')) &&
    (roleNameLower.includes('node') || roleNameLower.includes('backend') || roleNameLower.includes('developer'))
  ) {
    careerGoalScore = 15;
  } else if (
    (targetRole.includes('cloud') || targetRole.includes('devops')) &&
    (roleNameLower.includes('cloud') || roleNameLower.includes('devops') || roleNameLower.includes('infra'))
  ) {
    careerGoalScore = 15;
  } else if (
    (targetRole.includes('data') || targetRole.includes('ai') || targetRole.includes('ml')) &&
    (roleNameLower.includes('ai') || roleNameLower.includes('data') || roleNameLower.includes('machine learning'))
  ) {
    careerGoalScore = 15;
  } else if (targetRole.includes('developer') || targetRole.includes('engineer')) {
    careerGoalScore = 11;
  }

  // 5. Previous Project Relevance (Weight: 10%)
  let evidenceScore = 2;
  let relevantEvidenceCount = 0;
  teachSkills.forEach((us) => {
    if (us.evidence && us.evidence.length > 0) {
      const skillName = (us.skillId?.name || '').toLowerCase();
      if (roleSkills.some((rs) => rs.toLowerCase() === skillName)) {
        relevantEvidenceCount += us.evidence.length;
      }
    }
  });

  if (relevantEvidenceCount >= 2) evidenceScore = 10;
  else if (relevantEvidenceCount === 1) evidenceScore = 7;
  else if (teachSkills.some((us) => us.evidence && us.evidence.length > 0)) evidenceScore = 4;

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(skillScore + interestScore + difficultyScore + careerGoalScore + evidenceScore)
    )
  );

  // Recommendation Reason Generator
  let recommendationReason = '';
  const topMatchedSkill = matchedSkills[0]?.name;

  if (matchedSkills.length > 0) {
    const matchedList = matchedSkills.map((s) => s.name).join(', ');
    const evidenceStr = relevantEvidenceCount > 0 ? ` with ${relevantEvidenceCount} verified project deliverable(s)` : '';
    recommendationReason = `${candidate.name} is proficient in ${matchedList}${evidenceStr}, with career goals targeting ${candidate.targetRole || 'engineering'} that directly align with your ${role.roleName} role.`;
  } else if (candidate.targetRole && candidate.targetRole.toLowerCase().includes(roleNameLower.split(' ')[0])) {
    recommendationReason = `${candidate.name} actively targets ${candidate.targetRole} and has foundational skills in ${project.category}, making them an enthusiastic learner for ${role.roleName}.`;
  } else {
    recommendationReason = `${candidate.name} has proven expertise in ${teachSkills.slice(0, 2).map((s) => s.skillId?.name).join(', ')} and shares interests in ${candidate.interests?.slice(0, 2).join(', ')}.`;
  }

  return {
    candidate: {
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      college: candidate.college,
      branch: candidate.branch,
      graduationYear: candidate.graduationYear,
      profileImage: candidate.profileImage,
      targetRole: candidate.targetRole,
      bio: candidate.bio,
      interests: candidate.interests,
    },
    role: {
      _id: role._id,
      roleName: role.roleName,
      description: role.description,
      skills: roleSkills,
      spots: role.spots || 1,
      filled: role.filled || 0,
    },
    score: totalScore,
    breakdown: {
      skillMatch: skillScore,
      interestMatch: interestScore,
      difficultyCompatibility: difficultyScore,
      careerGoalMatch: careerGoalScore,
      previousProjectRelevance: evidenceScore,
    },
    matchedSkills,
    missingSkills,
    recommendationReason,
    isAvailable: true,
  };
};

/**
 * Recommends and ranks collaborators for all open required roles in a project.
 */
export const recommendCollaboratorsForProject = (
  project,
  candidates = [],
  candidatesSkillMap = new Map(),
  targetRoleFilter = null
) => {
  // If project has no explicit requiredRoles, derive standard roles from project category & skills
  let roles = project.requiredRoles || [];
  if (roles.length === 0) {
    const skills = (project.requiredSkills || []).map((s) => s.name);
    if (project.category === 'Web Development') {
      roles = [
        { roleName: 'React Developer', skills: ['React', 'Tailwind CSS'].filter((s) => skills.includes(s)) },
        { roleName: 'Node.js Developer', skills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL'].filter((s) => skills.includes(s)) },
        { roleName: 'UI/UX Designer', skills: ['Tailwind CSS', 'React'].filter((s) => skills.includes(s)) },
      ];
    } else if (project.category === 'Cloud') {
      roles = [
        { roleName: 'DevOps & Cluster Engineer', skills: ['Docker', 'Kubernetes', 'Linux'].filter((s) => skills.includes(s)) },
        { roleName: 'Backend Systems Developer', skills: ['Go', 'Node.js', 'Python'].filter((s) => skills.includes(s)) },
      ];
    } else if (project.category === 'AI' || project.category === 'Data Science') {
      roles = [
        { roleName: 'Machine Learning Engineer', skills: ['Python', 'PyTorch', 'LangChain'].filter((s) => skills.includes(s)) },
        { roleName: 'Data Pipeline Architect', skills: ['Python', 'Pandas', 'PostgreSQL'].filter((s) => skills.includes(s)) },
      ];
    } else {
      roles = [
        { roleName: `${project.category} Specialist`, skills },
        { roleName: 'Full Stack Collaborator', skills },
      ];
    }
  }

  // Filter roles if targetRoleFilter is provided
  if (targetRoleFilter && targetRoleFilter !== 'ALL') {
    roles = roles.filter(
      (r) => (r.roleName || '').toLowerCase() === targetRoleFilter.toLowerCase()
    );
  }

  // Collect active member IDs and creator ID to exclude from recommendations
  const activeMemberIds = new Set(
    (project.members || [])
      .filter((m) => m.status === 'ACTIVE')
      .map((m) => (m.userId?._id || m.userId).toString())
  );
  if (project.creatorId) {
    activeMemberIds.add((project.creatorId?._id || project.creatorId).toString());
  }

  const eligibleCandidates = candidates.filter(
    (c) => !activeMemberIds.has(c._id.toString())
  );

  const roleRecommendations = [];

  roles.forEach((role) => {
    const candidatesForRole = eligibleCandidates.map((candidate) => {
      const skills = candidatesSkillMap.get(candidate._id.toString()) || [];
      return calculateCandidateRoleScore(candidate, skills, role, project);
    });

    // Sort descending by match score
    candidatesForRole.sort((a, b) => b.score - a.score);

    roleRecommendations.push({
      role: {
        _id: role._id,
        roleName: role.roleName,
        description: role.description || '',
        skills: extractSkillsForRole(role, project),
        spots: role.spots || 1,
        filled: role.filled || 0,
      },
      recommendedCandidates: candidatesForRole.slice(0, 10),
    });
  });

  return roleRecommendations;
};
