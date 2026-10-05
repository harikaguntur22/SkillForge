import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('========================================================');
  console.log('SKILLFORGE PHASE 4 AUTOMATED TEST SUITE: PROJECT CATALOG');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const test = (description, fn) => {
    try {
      fn();
      console.log(`[PASS] ${description}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${description}`);
      console.error(`       Error: ${err.message}`);
      failed++;
    }
  };

  // Helper for requests
  const request = async (endpoint, options = {}) => {
    const { headers = {}, ...restOptions } = options;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  };

  try {
    // 1. Authenticate users
    console.log('--- TEST 1: User Authentication for Project Operations ---');
    const alexLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex.rivera@mit.edu', password: 'Alex@123456' }),
    });
    test('Alex login successful', () => {
      assert.strictEqual(alexLogin.status, 200);
      assert.ok(alexLogin.data.data.token);
    });
    const alexToken = alexLogin.data.data.token;
    const alexId = alexLogin.data.data.user._id;

    const priyaLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'priya.patel@stanford.edu', password: 'Priya@123456' }),
    });
    test('Priya login successful', () => {
      assert.strictEqual(priyaLogin.status, 200);
      assert.ok(priyaLogin.data.data.token);
    });
    const priyaToken = priyaLogin.data.data.token;

    // 2. Browse Projects & Seed Data Validation
    console.log('\n--- TEST 2: Browse Projects Catalog ---');
    const listRes = await request('/projects?limit=20');
    test('GET /api/projects returns 200 OK', () => {
      assert.strictEqual(listRes.status, 200);
      assert.strictEqual(listRes.data.success, true);
    });

    test('At least 15 projects exist in catalog', () => {
      assert.ok(listRes.data.data.length >= 15, `Expected >= 15 projects, got ${listRes.data.data.length}`);
    });

    test('All 6 categories are represented in projects', () => {
      const categories = new Set(listRes.data.data.map((p) => p.category));
      assert.ok(categories.has('Web Development'), 'Missing Web Development');
      assert.ok(categories.has('AI'), 'Missing AI');
      assert.ok(categories.has('Data Science'), 'Missing Data Science');
      assert.ok(categories.has('Mobile'), 'Missing Mobile');
      assert.ok(categories.has('Cloud'), 'Missing Cloud');
      assert.ok(categories.has('Cybersecurity'), 'Missing Cybersecurity');
    });

    // 3. Search Projects
    console.log('\n--- TEST 3: Search Projects by Keyword ---');
    const searchRes = await request('/projects?search=Whiteboard');
    test('Search returns matching project', () => {
      assert.strictEqual(searchRes.status, 200);
      assert.ok(searchRes.data.data.length > 0);
      assert.ok(searchRes.data.data[0].title.includes('Whiteboard'));
    });

    // 4. Filter Projects by Category
    console.log('\n--- TEST 4: Filter Projects by Category & Difficulty ---');
    const catRes = await request('/projects?category=Cybersecurity');
    test('Filter by Cybersecurity returns only Cybersecurity projects', () => {
      assert.strictEqual(catRes.status, 200);
      assert.ok(catRes.data.data.length >= 3);
      assert.ok(catRes.data.data.every((p) => p.category === 'Cybersecurity'));
    });

    const diffRes = await request('/projects?difficulty=ADVANCED');
    test('Filter by ADVANCED difficulty returns only advanced projects', () => {
      assert.strictEqual(diffRes.status, 200);
      assert.ok(diffRes.data.data.length > 0);
      assert.ok(diffRes.data.data.every((p) => p.difficulty === 'ADVANCED'));
    });

    // 5. View Single Project Details
    console.log('\n--- TEST 5: View Single Project Details ---');
    const sampleProject = listRes.data.data[0];
    const detailRes = await request(`/projects/${sampleProject._id}`);
    test('GET /api/projects/:id returns 200 OK with populated fields', () => {
      assert.strictEqual(detailRes.status, 200);
      assert.strictEqual(detailRes.data.data._id, sampleProject._id);
      assert.ok(detailRes.data.data.creatorId.name);
      assert.ok(detailRes.data.data.creatorId.college);
      assert.ok(Array.isArray(detailRes.data.data.requiredSkills));
      assert.ok(detailRes.data.data.requiredSkills.length > 0);
      assert.ok(detailRes.data.data.requiredSkills[0].name);
      assert.ok(detailRes.data.data.requiredSkills[0].level);
    });

    // 6. Create Project
    console.log('\n--- TEST 6: Create New Project ---');
    // Fetch a valid canonical skill
    const skillsRes = await request('/skills');
    const skillsList = skillsRes.data.data.skills || [];
    const reactSkill = skillsList.find((s) => s.name === 'React');
    const nodeSkill = skillsList.find((s) => s.name === 'Node.js');

    const newProjectPayload = {
      title: 'DevCollab - Open Source Pair Programming IDE',
      tagline: 'Browser-based Monaco editor with live voice and terminal sharing.',
      description: 'An interactive online code pairing environment where student developers can code simultaneously in real-time with integrated audio/video and shared bash terminal emulation.',
      category: 'Web Development',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '5-6 weeks',
      teamSize: 3,
      tags: ['React', 'WebSockets', 'PairProgramming'],
      deliverables: [
        'Monaco editor integration with syntax highlighting',
        'WebRTC peer mesh for low-latency audio',
        'Dockerized sandboxed code execution runner',
      ],
      requiredSkills: [
        { skillId: reactSkill._id, name: 'React', level: 'INTERMEDIATE', isMandatory: true },
        { skillId: nodeSkill._id, name: 'Node.js', level: 'INTERMEDIATE', isMandatory: true },
      ],
    };

    const createRes = await request('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify(newProjectPayload),
    });

    if (createRes.status !== 201) {
      console.error('Create project failed:', createRes.data);
    }

    test('POST /api/projects returns 201 Created', () => {
      assert.strictEqual(createRes.status, 201);
      assert.strictEqual(createRes.data.success, true);
      assert.strictEqual(createRes.data.data.title, newProjectPayload.title);
      assert.strictEqual(createRes.data.data.creatorId._id, alexId);
    });
    const createdProjectId = createRes.data.data._id;

    // 7. Edit Own Project
    console.log('\n--- TEST 7: Edit Own Project ---');
    const updateRes = await request(`/projects/${createdProjectId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${alexToken}` },
      body: JSON.stringify({
        teamSize: 4,
        estimatedDuration: '6-8 weeks',
        tagline: 'Updated browser-based collaborative editor.',
      }),
    });

    test('PUT /api/projects/:id updates project fields successfully', () => {
      assert.strictEqual(updateRes.status, 200);
      assert.strictEqual(updateRes.data.data.teamSize, 4);
      assert.strictEqual(updateRes.data.data.estimatedDuration, '6-8 weeks');
      assert.strictEqual(updateRes.data.data.tagline, 'Updated browser-based collaborative editor.');
    });

    // 8. Ownership Protection: Prevent Non-Owner from Editing
    console.log('\n--- TEST 8: Ownership Protection (Forbidden Access) ---');
    const unauthorizedUpdate = await request(`/projects/${createdProjectId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${priyaToken}` },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });

    test('Non-owner cannot edit project (403 Forbidden)', () => {
      assert.strictEqual(unauthorizedUpdate.status, 403);
    });

    const unauthorizedDelete = await request(`/projects/${createdProjectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${priyaToken}` },
    });

    test('Non-owner cannot delete project (403 Forbidden)', () => {
      assert.strictEqual(unauthorizedDelete.status, 403);
    });

    // 9. Delete Own Project
    console.log('\n--- TEST 9: Delete Own Project ---');
    const deleteRes = await request(`/projects/${createdProjectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${alexToken}` },
    });

    test('Owner can delete their project (200 OK)', () => {
      assert.strictEqual(deleteRes.status, 200);
      assert.strictEqual(deleteRes.data.success, true);
    });

    // 10. Verify Deletion
    const verifyDelete = await request(`/projects/${createdProjectId}`);
    test('Deleted project returns 404 Not Found', () => {
      assert.strictEqual(verifyDelete.status, 404);
    });

  } catch (error) {
    console.error('Fatal test runner error:', error);
  }

  console.log('\n========================================================');
  console.log(`PHASE 4 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
