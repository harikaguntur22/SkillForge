import { SKILL_LEVELS, PROJECT_DIFFICULTIES } from '../config/constants.js';

// Level numeric weights for proficiency comparison
const LEVEL_WEIGHTS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

// Domain learning actions for dynamic learning path generation
const SKILL_LEARNING_ACTIONS = {
  React: 'Master component state patterns, custom hooks, and memoized rendering.',
  'Next.js': 'Build server-rendered pages, API route handlers, and static generation pipelines.',
  TypeScript: 'Implement strict typing, generics, utility types, and interface contracts.',
  'Tailwind CSS': 'Learn utility layout composition, responsive flex/grid, and theme variables.',
  'Node.js': 'Construct asynchronous event loops, streaming buffers, and modular REST handlers.',
  'Express.js': 'Structure middleware chains, error boundaries, and input validator pipelines.',
  Python: 'Understand object-oriented Python, decorators, type hints, and virtual environments.',
  FastAPI: 'Build asynchronous Pydantic request models and auto-documenting OpenAPI endpoints.',
  MongoDB: 'Design document schemas, compound indexes, aggregation pipelines, and write concern.',
  PostgreSQL: 'Design relational tables, foreign key constraints, ACID transactions, and CTE queries.',
  Redis: 'Implement in-memory hash caching, pub/sub queues, and token-bucket rate limiters.',
  Docker: 'Write multi-stage Dockerfiles, minimize image layers, and configure network bridges.',
  Kubernetes: 'Deploy ReplicaSets, Ingress controllers, DaemonSets, and manage ConfigMaps.',
  AWS: 'Provision IAM roles, S3 buckets, Lambda serverless workers, and CloudWatch metrics.',
  Linux: 'Practice systemd daemon creation, shell scripting, permission bits, and networking tools.',
  WebSockets: 'Handle duplex client-server protocols, heartbeats, and room broadcasting.',
  PyTorch: 'Build PyTorch Tensor datasets, convolutional layers, loss functions, and backpropagation.',
  LangChain: 'Construct prompt chains, hybrid vector stores, chunking pipelines, and agent memory.',
  Pandas: 'Perform DataFrame indexing, vectorized rolling calculations, grouping, and pivots.',
  'React Native': 'Set up native bridge components, gesture handlers, and AsyncStorage caching.',
  Flutter: 'Master Widget tree lifecycles, provider state management, and native compilation.',
  'Network Security': 'Inspect raw network packets, validate mTLS handshakes, and configure firewall rules.',
  'OWASP Security': 'Prevent SQL injection, XSS attack vectors, and enforce secure HTTP headers.',
  Cryptography: 'Implement AES-256 encryption, RSA public-key signatures, and PBKDF2 hashing.',
};

/**
 * Pure rule-based recommendation engine evaluating a single (user, userSkills, project) tuple.
 */
export const calculateProjectRecommendation = (user, userSkills = [], project) => {
  const userTeachSkills = userSkills.filter((s) => s.type === 'TEACH');
  const userSkillMap = new Map();
  userTeachSkills.forEach((us) => {
    const skillName = us.skillId?.name || us.name || '';
    if (skillName) {
      userSkillMap.set(skillName.toLowerCase(), {
        name: skillName,
        level: us.level || SKILL_LEVELS.INTERMEDIATE,
        isVerified: us.isVerified || false,
        evidence: us.evidence || [],
      });
    }
  });

  const requiredSkills = project.requiredSkills || [];

  // ==========================================
  // 1. REQUIRED SKILL MATCH (Weight: 40%)
  // ==========================================
  const matchedSkills = [];
  const missingSkills = [];
  const skillGaps = [];
  let totalSkillCredit = 0;

  if (requiredSkills.length === 0) {
    totalSkillCredit = 1;
  } else {
    requiredSkills.forEach((reqSkill) => {
      const normalizedName = reqSkill.name.toLowerCase();
      const userSkill = userSkillMap.get(normalizedName);
      const reqWeight = LEVEL_WEIGHTS[reqSkill.level] || 2;

      if (!userSkill) {
        missingSkills.push({
          name: reqSkill.name,
          requiredLevel: reqSkill.level,
          isMandatory: reqSkill.isMandatory !== false,
        });
      } else {
        const userWeight = LEVEL_WEIGHTS[userSkill.level] || 2;
        if (userWeight >= reqWeight) {
          // Full credit
          totalSkillCredit += 1.0;
          matchedSkills.push({
            name: reqSkill.name,
            userLevel: userSkill.level,
            requiredLevel: reqSkill.level,
            status: userWeight > reqWeight ? 'PROFICIENT' : 'MET',
            isVerified: userSkill.isVerified,
          });
        } else {
          // Partial credit with penalty for gap
          const gapDelta = userWeight - reqWeight; // e.g. -1 or -2
          const partialCredit = gapDelta === -1 ? 0.75 : 0.45;
          totalSkillCredit += partialCredit;

          skillGaps.push({
            name: reqSkill.name,
            userLevel: userSkill.level,
            requiredLevel: reqSkill.level,
            delta: gapDelta,
          });

          matchedSkills.push({
            name: reqSkill.name,
            userLevel: userSkill.level,
            requiredLevel: reqSkill.level,
            status: 'GAP',
            isVerified: userSkill.isVerified,
          });
        }
      }
    });
  }

  const skillMatchRatio = requiredSkills.length > 0 ? totalSkillCredit / requiredSkills.length : 1;
  const skillScore = Math.min(40, Math.round(skillMatchRatio * 40 * 10) / 10);

  // ==========================================
  // 2. INTEREST / CATEGORY MATCH (Weight: 20%)
  // ==========================================
  const userInterests = (user.interests || []).map((i) => i.toLowerCase());
  const projectCategory = (project.category || '').toLowerCase();
  const projectTags = (project.tags || []).map((t) => t.toLowerCase());

  let interestScore = 4; // Baseline tech interest
  let categoryMatched = false;

  // Category keyword check against user interests
  if (
    userInterests.some(
      (interest) =>
        interest.includes(projectCategory) ||
        projectCategory.includes(interest) ||
        (projectCategory.includes('web') && interest.includes('frontend')) ||
        (projectCategory.includes('web') && interest.includes('fullstack')) ||
        (projectCategory.includes('cloud') && interest.includes('devops')) ||
        (projectCategory.includes('ai') && interest.includes('machine learning')) ||
        (projectCategory.includes('data') && interest.includes('analytics'))
    )
  ) {
    interestScore = 14;
    categoryMatched = true;
  } else {
    // Check if user has skills belonging to this category
    const hasCategorySkill = userTeachSkills.some(
      (s) => s.skillId?.category?.toLowerCase() === projectCategory
    );
    if (hasCategorySkill) {
      interestScore = 10;
    }
  }

  // Tag overlap bonus
  let tagMatches = 0;
  projectTags.forEach((tag) => {
    if (userInterests.some((i) => i.includes(tag) || tag.includes(i))) {
      tagMatches++;
    }
  });

  interestScore = Math.min(20, interestScore + tagMatches * 3);

  // ==========================================
  // 3. DIFFICULTY COMPATIBILITY (Weight: 15%)
  // ==========================================
  // Assess user overall proficiency level
  let highestUserLevel = 1;
  userTeachSkills.forEach((s) => {
    const w = LEVEL_WEIGHTS[s.level] || 1;
    if (w > highestUserLevel) highestUserLevel = w;
  });

  const projDiff = project.difficulty || PROJECT_DIFFICULTIES.INTERMEDIATE;
  let difficultyScore = 10;

  if (highestUserLevel >= 3) {
    // Advanced/Expert User
    if (projDiff === 'ADVANCED') difficultyScore = 15;
    else if (projDiff === 'INTERMEDIATE') difficultyScore = 14;
    else difficultyScore = 10; // Beginner is slightly below their capability
  } else if (highestUserLevel === 2) {
    // Intermediate User
    if (projDiff === 'INTERMEDIATE') difficultyScore = 15;
    else if (projDiff === 'BEGINNER') difficultyScore = 13;
    else difficultyScore = 9; // Advanced is an ambitious stretch
  } else {
    // Beginner User
    if (projDiff === 'BEGINNER') difficultyScore = 15;
    else if (projDiff === 'INTERMEDIATE') difficultyScore = 10;
    else difficultyScore = 4; // Advanced is too far
  }

  // ==========================================
  // 4. CAREER GOAL MATCH (Weight: 15%)
  // ==========================================
  const targetRole = (user.targetRole || '').toLowerCase();
  let careerGoalScore = 5; // Baseline career relevance

  if (targetRole) {
    if (
      (targetRole.includes('full stack') || targetRole.includes('frontend')) &&
      projectCategory.includes('web')
    ) {
      careerGoalScore = 15;
    } else if (
      (targetRole.includes('cloud') || targetRole.includes('devops') || targetRole.includes('sre')) &&
      projectCategory.includes('cloud')
    ) {
      careerGoalScore = 15;
    } else if (
      (targetRole.includes('data') || targetRole.includes('ml') || targetRole.includes('ai')) &&
      (projectCategory.includes('data') || projectCategory.includes('ai'))
    ) {
      careerGoalScore = 15;
    } else if (
      (targetRole.includes('security') || targetRole.includes('cyber')) &&
      projectCategory.includes('cybersecurity')
    ) {
      careerGoalScore = 15;
    } else if (targetRole.includes('mobile') && projectCategory.includes('mobile')) {
      careerGoalScore = 15;
    } else if (targetRole.includes('full stack') && (projectCategory.includes('mobile') || projectCategory.includes('cloud'))) {
      careerGoalScore = 12;
    } else if (targetRole.includes('software') || targetRole.includes('developer') || targetRole.includes('engineer')) {
      careerGoalScore = 10;
    } else {
      careerGoalScore = 7;
    }
  }

  // ==========================================
  // 5. PREVIOUS PROJECT RELEVANCE (Weight: 10%)
  // ==========================================
  let projectRelevanceScore = 2; // Baseline
  let relevantEvidenceCount = 0;

  userTeachSkills.forEach((us) => {
    if (us.evidence && us.evidence.length > 0) {
      const skillName = (us.skillId?.name || '').toLowerCase();
      // Check if this verified skill is required in the project
      if (requiredSkills.some((rs) => rs.name.toLowerCase() === skillName)) {
        relevantEvidenceCount++;
      }
    }
  });

  if (relevantEvidenceCount >= 2) {
    projectRelevanceScore = 10;
  } else if (relevantEvidenceCount === 1) {
    projectRelevanceScore = 7;
  } else if (userTeachSkills.some((us) => us.evidence && us.evidence.length > 0)) {
    projectRelevanceScore = 4; // Has some project evidence in other stacks
  }

  // ==========================================
  // TOTAL AGGREGATE SCORE (0 - 100)
  // ==========================================
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        skillScore +
        interestScore +
        difficultyScore +
        careerGoalScore +
        projectRelevanceScore
      )
    )
  );

  // ==========================================
  // READINESS STATUS
  // ==========================================
  let readinessStatus = 'NEEDS_PREPARATION';
  if (totalScore >= 78 && missingSkills.length === 0 && skillGaps.length === 0) {
    readinessStatus = 'READY_TO_BUILD';
  } else if (totalScore >= 75 && missingSkills.length === 0) {
    readinessStatus = 'READY_TO_BUILD';
  } else if (totalScore < 50 || missingSkills.length >= 3) {
    readinessStatus = 'STRETCH_PROJECT';
  } else {
    readinessStatus = 'NEEDS_PREPARATION';
  }

  // ==========================================
  // RECOMMENDATION REASON GENERATOR
  // ==========================================
  let reason = '';
  const matchedCount = matchedSkills.filter((s) => s.status !== 'GAP').length;
  const totalReq = requiredSkills.length;

  if (readinessStatus === 'READY_TO_BUILD') {
    reason = `You are fully equipped to build this project! Your verified skills cover the required stack (${matchedSkills.map((s) => s.name).join(', ')}), with direct alignment to your ${user.targetRole || 'engineering'} goals.`;
  } else if (readinessStatus === 'NEEDS_PREPARATION') {
    const missingNames = missingSkills.map((s) => s.name);
    const gapNames = skillGaps.map((s) => s.name);
    const combinedGaps = [...missingNames, ...gapNames];

    reason = `Your profile matches ${Math.round((matchedCount / totalReq) * 100)}% of the core architecture (${matchedSkills.map((s) => s.name).slice(0, 3).join(', ')}), but you need ${combinedGaps.slice(0, 2).join(' and ')} before taking on production deliverables.`;
  } else {
    reason = `This is a high-impact stretch project requiring advanced expertise in ${missingSkills.slice(0, 3).map((s) => s.name).join(', ')}. Perfect for ambitious growth after mastering initial prerequisites.`;
  }

  // ==========================================
  // LEARNING PATH GENERATION
  // ==========================================
  const learningPath = [];

  // Add missing skills
  missingSkills.forEach((ms, index) => {
    const defaultAction =
      SKILL_LEARNING_ACTIONS[ms.name] ||
      `Study core concepts, standard libraries, and build an isolated demonstration project for ${ms.name}.`;

    learningPath.push({
      step: index + 1,
      skill: ms.name,
      currentLevel: 'NONE',
      targetLevel: ms.requiredLevel,
      action: defaultAction,
      estimatedHours: ms.requiredLevel === 'ADVANCED' ? 25 : ms.requiredLevel === 'INTERMEDIATE' ? 15 : 8,
      importance: ms.isMandatory ? 'MANDATORY' : 'RECOMMENDED',
    });
  });

  // Add skill gaps (needs upgrade)
  skillGaps.forEach((gap, index) => {
    learningPath.push({
      step: missingSkills.length + index + 1,
      skill: gap.name,
      currentLevel: gap.userLevel,
      targetLevel: gap.requiredLevel,
      action: `Level up ${gap.name} from ${gap.userLevel} to ${gap.requiredLevel} through deep-dive implementation and code refactoring.`,
      estimatedHours: Math.abs(gap.delta) * 10,
      importance: 'RECOMMENDED',
    });
  });

  return {
    project,
    score: totalScore,
    readinessStatus,
    breakdown: {
      skillMatch: skillScore, // max 40
      interestMatch: interestScore, // max 20
      difficultyCompatibility: difficultyScore, // max 15
      careerGoalMatch: careerGoalScore, // max 15
      previousProjectRelevance: projectRelevanceScore, // max 10
    },
    matchedSkills,
    missingSkills,
    skillGaps,
    recommendationReason: reason,
    reason,
    status: readinessStatus,
    learningPath,
  };
};

/**
 * Ranks all available projects for a user, sorted by compatibility score descending.
 */
export const rankProjectsForUser = (user, userSkills = [], projects = []) => {
  const recommendations = projects.map((project) =>
    calculateProjectRecommendation(user, userSkills, project)
  );

  return recommendations.sort((a, b) => b.score - a.score);
};
