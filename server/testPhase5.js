import assert from 'assert';

const API_BASE = 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const { headers = {}, ...rest } = options;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
};

const runPhase5Tests = async () => {
  console.log('====================================================');
  console.log('🚀 RUNNING PHASE 5: PROJECT RECOMMENDATION ENGINE TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${err.message}\n`);
    }
  };

  // 1. Unauthenticated guard
  await test('GET /api/projects/recommended rejects unauthenticated requests', async () => {
    const res = await request('/projects/recommended');
    assert.strictEqual(res.status, 401, 'Should return 401 Unauthorized');
    assert.strictEqual(res.data.success, false);
  });

  // Login Alex Rivera (Full Stack / Backend)
  const alexLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'alex.rivera@mit.edu',
      password: 'Alex@123456',
    }),
  });
  assert.strictEqual(alexLogin.status, 200, 'Alex login should succeed');
  const alexToken = alexLogin.data.data.token;
  const alexAuthHeader = { Authorization: `Bearer ${alexToken}` };

  // Login Priya Patel (Frontend / React)
  const priyaLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'priya.patel@stanford.edu',
      password: 'Priya@123456',
    }),
  });
  assert.strictEqual(priyaLogin.status, 200, 'Priya login should succeed');
  const priyaToken = priyaLogin.data.data.token;
  const priyaAuthHeader = { Authorization: `Bearer ${priyaToken}` };

  // Login Marcus Chen (DevOps / Cloud / Go / K8s)
  const marcusLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'marcus.chen@mit.edu',
      password: 'Marcus@123456',
    }),
  });
  assert.strictEqual(marcusLogin.status, 200, 'Marcus login should succeed');
  const marcusToken = marcusLogin.data.data.token;
  const marcusAuthHeader = { Authorization: `Bearer ${marcusToken}` };

  // 2. Fetch Alex's recommendations
  let alexRecsResponse;
  await test('Alex: GET /api/projects/recommended returns structured recommendations', async () => {
    const res = await request('/projects/recommended', { headers: alexAuthHeader });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data), 'data should be an array of recommendations');
    assert.ok(res.data.data.length > 0, 'should return recommended projects');
    assert.ok(res.data.stats, 'should include recommendation stats');
    assert.ok(res.data.userProfile, 'should include userProfile summary');
    alexRecsResponse = res.data;
  });

  // 3. Validate complete payload structure for top recommendation
  await test('Validate recommendation object schema and required fields', async () => {
    const topRec = alexRecsResponse.data[0];
    assert.ok(topRec.project, 'Must include project details');
    assert.ok(topRec.project.title, 'Project must have a title');
    assert.ok(typeof topRec.score === 'number', 'Score must be a number');
    assert.ok(topRec.score >= 0 && topRec.score <= 100, 'Score must be between 0 and 100');

    // Required fields per spec
    assert.ok(Array.isArray(topRec.matchedSkills), 'matchedSkills must be an array');
    assert.ok(Array.isArray(topRec.missingSkills), 'missingSkills must be an array');
    assert.ok(Array.isArray(topRec.skillGaps), 'skillGaps must be an array');
    assert.ok(
      typeof topRec.recommendationReason === 'string' && topRec.recommendationReason.length > 0,
      'recommendationReason must be a non-empty string'
    );
    assert.ok(
      ['READY_TO_BUILD', 'NEEDS_PREPARATION', 'STRETCH_PROJECT'].includes(topRec.readinessStatus),
      `readinessStatus (${topRec.readinessStatus}) must be a valid status`
    );
    assert.ok(Array.isArray(topRec.learningPath), 'learningPath must be an array');

    // 5-factor breakdown validation
    assert.ok(topRec.breakdown, 'breakdown must exist');
    assert.ok(typeof topRec.breakdown.skillMatch === 'number', 'skillMatch <= 40');
    assert.ok(topRec.breakdown.skillMatch <= 40, 'skillMatch <= 40');
    assert.ok(typeof topRec.breakdown.interestMatch === 'number', 'interestMatch <= 20');
    assert.ok(topRec.breakdown.interestMatch <= 20, 'interestMatch <= 20');
    assert.ok(typeof topRec.breakdown.difficultyCompatibility === 'number', 'difficulty <= 15');
    assert.ok(topRec.breakdown.difficultyCompatibility <= 15, 'difficulty <= 15');
    assert.ok(typeof topRec.breakdown.careerGoalMatch === 'number', 'careerGoal <= 15');
    assert.ok(topRec.breakdown.careerGoalMatch <= 15, 'careerGoal <= 15');
    assert.ok(typeof topRec.breakdown.previousProjectRelevance === 'number', 'relevance <= 10');
    assert.ok(topRec.breakdown.previousProjectRelevance <= 10, 'relevance <= 10');
  });

  // 4. Verify deterministic sorting descending by score
  await test('Recommendations are sorted descending by score', async () => {
    const list = alexRecsResponse.data;
    for (let i = 0; i < list.length - 1; i++) {
      assert.ok(
        list[i].score >= list[i + 1].score,
        `Item at index ${i} (score: ${list[i].score}) should be >= item at index ${i + 1} (score: ${list[i + 1].score})`
      );
    }
  });

  // 5. Verify Priya's recommendations match Frontend & React focus
  await test('Priya: Recommendations emphasize Frontend / Web Development stack', async () => {
    const res = await request('/projects/recommended', { headers: priyaAuthHeader });
    assert.strictEqual(res.status, 200);
    const topRecs = res.data.data.slice(0, 3);
    const hasWebOrMobile = topRecs.some(
      (r) => r.project.category === 'Web Development' || r.project.category === 'Mobile'
    );
    assert.ok(hasWebOrMobile, 'Priya top recommendations should feature Web or Mobile projects');

    // Priya knows React, so React should be in matchedSkills for React projects
    const reactProject = res.data.data.find((r) =>
      r.project.requiredSkills.some((s) => s.name.toLowerCase() === 'react')
    );
    if (reactProject) {
      const matchedNames = reactProject.matchedSkills.map((s) => s.name.toLowerCase());
      assert.ok(matchedNames.includes('react'), 'Priya should have React in matchedSkills');
    }
  });

  // 6. Verify Marcus's recommendations match Cloud & DevOps focus
  await test('Marcus: Recommendations emphasize Cloud / DevOps / Kubernetes', async () => {
    const res = await request('/projects/recommended', { headers: marcusAuthHeader });
    assert.strictEqual(res.status, 200);
    const topProject = res.data.data[0];
    assert.ok(
      ['Cloud', 'Cybersecurity'].includes(topProject.project.category),
      `Marcus top project (${topProject.project.title}, ${topProject.project.category}) should be Cloud or Cybersecurity`
    );
    // Marcus knows Docker, Linux, K8s
    const matched = topProject.matchedSkills.map((s) => s.name.toLowerCase());
    assert.ok(
      matched.includes('docker') || matched.includes('kubernetes') || matched.includes('linux'),
      'Marcus should match Docker, Kubernetes, or Linux in top project'
    );
  });

  // 7. Filtering by readinessStatus
  await test('Filter by readinessStatus=READY_TO_BUILD or NEEDS_PREPARATION', async () => {
    const res = await request('/projects/recommended?readinessStatus=READY_TO_BUILD', {
      headers: alexAuthHeader,
    });
    assert.strictEqual(res.status, 200);
    res.data.data.forEach((r) => {
      assert.strictEqual(r.readinessStatus, 'READY_TO_BUILD');
    });

    const resPrep = await request('/projects/recommended?readinessStatus=NEEDS_PREPARATION', {
      headers: alexAuthHeader,
    });
    assert.strictEqual(resPrep.status, 200);
    resPrep.data.data.forEach((r) => {
      assert.strictEqual(r.readinessStatus, 'NEEDS_PREPARATION');
    });
  });

  // 8. Filtering by category
  await test('Filter by category=Cybersecurity', async () => {
    const res = await request('/projects/recommended?category=Cybersecurity', {
      headers: alexAuthHeader,
    });
    assert.strictEqual(res.status, 200);
    res.data.data.forEach((r) => {
      assert.strictEqual(r.project.category, 'Cybersecurity');
    });
  });

  // 9. Filtering by minScore
  await test('Filter by minScore=70', async () => {
    const res = await request('/projects/recommended?minScore=70', {
      headers: alexAuthHeader,
    });
    assert.strictEqual(res.status, 200);
    res.data.data.forEach((r) => {
      assert.ok(r.score >= 70, `Score ${r.score} should be >= 70`);
    });
  });

  // 10. Direct unit verification for the exact prompt specification:
  // "Project: Real-Time Collaboration Platform, Matched: React, Node.js, MongoDB, Missing: Redis, WebSockets"
  await test('Engine Unit Test: Exact prompt scenario calculation', async () => {
    const { calculateProjectRecommendation } = await import(
      './services/projectRecommendationEngine.js'
    );

    const mockUser = {
      _id: 'mock_user_1',
      name: 'Alex Rivera',
      interests: ['Full Stack', 'Web Development'],
      targetRole: 'Full Stack Developer',
    };

    const mockUserSkills = [
      {
        skillId: { name: 'React', category: 'Frontend' },
        name: 'React',
        type: 'TEACH',
        level: 'ADVANCED',
        isVerified: true,
        evidence: [{ projectName: 'Real-Time App', role: 'Dev', description: 'Built UI' }],
      },
      {
        skillId: { name: 'Node.js', category: 'Backend' },
        name: 'Node.js',
        type: 'TEACH',
        level: 'INTERMEDIATE',
        isVerified: true,
        evidence: [{ projectName: 'API Server', role: 'Dev', description: 'Built REST API' }],
      },
      {
        skillId: { name: 'MongoDB', category: 'Database' },
        name: 'MongoDB',
        type: 'TEACH',
        level: 'INTERMEDIATE',
        isVerified: false,
      },
    ];

    const mockProject = {
      _id: 'mock_project_1',
      title: 'Real-Time Collaboration Platform',
      category: 'Web Development',
      difficulty: 'INTERMEDIATE',
      tags: ['fullstack', 'collaboration'],
      requiredSkills: [
        { name: 'React', level: 'INTERMEDIATE', isMandatory: true },
        { name: 'Node.js', level: 'INTERMEDIATE', isMandatory: true },
        { name: 'MongoDB', level: 'INTERMEDIATE', isMandatory: true },
        { name: 'Redis', level: 'INTERMEDIATE', isMandatory: true },
        { name: 'WebSockets', level: 'INTERMEDIATE', isMandatory: true },
      ],
    };

    const result = calculateProjectRecommendation(mockUser, mockUserSkills, mockProject);

    // Matched skills should be React, Node.js, MongoDB
    const matchedNames = result.matchedSkills.map((s) => s.name);
    assert.deepStrictEqual(matchedNames.sort(), ['MongoDB', 'Node.js', 'React'].sort());

    // Missing skills should be Redis, WebSockets
    const missingNames = result.missingSkills.map((s) => s.name);
    assert.deepStrictEqual(missingNames.sort(), ['Redis', 'WebSockets'].sort());

    // Status should be NEEDS_PREPARATION
    assert.strictEqual(result.readinessStatus, 'NEEDS_PREPARATION');
    assert.strictEqual(result.status, 'NEEDS_PREPARATION');

    // Score should be approx 70-75 (e.g. 72 per example)
    assert.ok(
      result.score >= 65 && result.score <= 80,
      `Score was ${result.score}, expected close to 72`
    );

    // Reason should mention missing Redis and WebSockets
    assert.ok(
      result.recommendationReason.includes('Redis') &&
        result.recommendationReason.includes('WebSockets'),
      `Reason should mention Redis and WebSockets. Got: "${result.recommendationReason}"`
    );

    // Learning path should contain actions for Redis and WebSockets
    const pathSkills = result.learningPath.map((p) => p.skill);
    assert.ok(pathSkills.includes('Redis'), 'Learning path must contain Redis');
    assert.ok(pathSkills.includes('WebSockets'), 'Learning path must contain WebSockets');
  });

  console.log('\n====================================================');
  console.log(`📊 PHASE 5 TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
};

runPhase5Tests();
