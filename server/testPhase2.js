// Automated test script for Phase 2 verification
const BASE_URL = 'http://localhost:5000/api';

const runPhase2Tests = async () => {
  console.log('========================================================');
  console.log('SKILLFORGE PHASE 2 AUTOMATED TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. CANONICAL SKILLS CATALOG
    console.log('--- TEST 1: Canonical Skills Catalog ---');
    const skillsRes = await fetch(`${BASE_URL}/skills`);
    const skillsData = await skillsRes.json();
    assert(skillsRes.status === 200, 'GET /api/skills returns 200 OK');
    assert(skillsData.data.skills.length >= 25, `Canonical catalog has ${skillsData.data.skills.length} skills`);

    // Category filter
    const frontendRes = await fetch(`${BASE_URL}/skills?category=Frontend`);
    const frontendData = await frontendRes.json();
    assert(frontendData.data.skills.every((s) => s.category === 'Frontend'), 'Category filtering works correctly');

    // 2. AUTHENTICATE AS ALEX RIVERA
    console.log('\n--- TEST 2: Authenticate as Alex Rivera ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.rivera@mit.edu', password: 'Alex@123456' }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    const alexId = loginData.data.user._id;
    assert(!!token, 'Obtained authentication Bearer token for Alex');

    // 3. GET USER SKILLS (TEACH vs LEARN)
    console.log('\n--- TEST 3: Fetch User Skills ---');
    const userSkillsRes = await fetch(`${BASE_URL}/user-skills`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userSkillsData = await userSkillsRes.json();
    assert(userSkillsRes.status === 200, 'GET /api/user-skills returns 200 OK');
    assert(userSkillsData.data.teach.length >= 3, `Alex has ${userSkillsData.data.teach.length} skills he can teach`);
    assert(userSkillsData.data.learn.length >= 2, `Alex has ${userSkillsData.data.learn.length} skills he wants to learn`);

    // Verify seeded Python evidence
    const pythonSkill = userSkillsData.data.teach.find((s) => s.skillId.name === 'Python');
    assert(!!pythonSkill, "Python found in Alex's 'teach' skills");
    assert(pythonSkill.isVerified === true, 'Python is marked as verified');
    assert(pythonSkill.evidence.length > 0, `Python has ${pythonSkill.evidence.length} project evidence entry`);
    assert(pythonSkill.evidence[0].projectName.includes('Task Queue'), 'Evidence project name matches seed data');

    // 4. ADD NEW SKILL (TEACH INTENT)
    console.log('\n--- TEST 4: Add New Skill to Profile ---');
    const addSkillRes = await fetch(`${BASE_URL}/user-skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        skillName: 'Go',
        category: 'Backend',
        type: 'TEACH',
        level: 'INTERMEDIATE',
        yearsExperience: 2,
      }),
    });
    const addSkillData = await addSkillRes.json();
    assert(addSkillRes.status === 201, 'POST /api/user-skills returns 201 Created');
    assert(addSkillData.data.userSkill.skillId.name === 'Go', 'Added skill name is Go');
    const createdSkillId = addSkillData.data.userSkill._id;

    // 5. UPDATE SKILL LEVEL
    console.log('\n--- TEST 5: Update Skill Level ---');
    const updateSkillRes = await fetch(`${BASE_URL}/user-skills/${createdSkillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        level: 'ADVANCED',
        yearsExperience: 3,
      }),
    });
    const updateSkillData = await updateSkillRes.json();
    assert(updateSkillRes.status === 200, 'PUT /api/user-skills/:id returns 200 OK');
    assert(updateSkillData.data.userSkill.level === 'ADVANCED', 'Skill level updated to ADVANCED');
    assert(updateSkillData.data.userSkill.yearsExperience === 3, 'Years of experience updated to 3');

    // 6. ATTACH PROJECT EVIDENCE
    console.log('\n--- TEST 6: Attach Project Evidence ---');
    const evidenceRes = await fetch(`${BASE_URL}/user-skills/${createdSkillId}/evidence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        projectName: 'High-Throughput Go Microservice',
        role: 'Core Backend Contributor',
        description: 'Built gRPC microservices pipeline processing 10k events/sec with Prometheus telemetry.',
        githubUrl: 'https://github.com/alexrivera-demo/go-microservice',
        demoUrl: '',
      }),
    });
    const evidenceData = await evidenceRes.json();
    assert(evidenceRes.status === 201, 'POST /api/user-skills/:id/evidence returns 201 Created');
    assert(evidenceData.data.userSkill.isVerified === true, 'Skill marked as verified upon attaching evidence');
    assert(evidenceData.data.userSkill.evidence.length === 1, 'Evidence item present in array');
    const evidenceId = evidenceData.data.userSkill.evidence[0]._id;

    // 7. DELETE EVIDENCE
    console.log('\n--- TEST 7: Remove Evidence ---');
    const delEvidenceRes = await fetch(`${BASE_URL}/user-skills/${createdSkillId}/evidence/${evidenceId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const delEvidenceData = await delEvidenceRes.json();
    assert(delEvidenceRes.status === 200, 'DELETE /api/user-skills/:id/evidence/:evidenceId returns 200 OK');
    assert(delEvidenceData.data.userSkill.evidence.length === 0, 'Evidence item successfully removed');
    assert(delEvidenceData.data.userSkill.isVerified === false, 'isVerified reset to false after evidence removal');

    // 8. DELETE USER SKILL
    console.log('\n--- TEST 8: Delete User Skill ---');
    const delSkillRes = await fetch(`${BASE_URL}/user-skills/${createdSkillId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(delSkillRes.status === 200, 'DELETE /api/user-skills/:id returns 200 OK');

    // 9. PUBLIC USER PROFILE INSPECTION
    console.log('\n--- TEST 9: Public User Profile with Skills & Evidence ---');
    const publicProfileRes = await fetch(`${BASE_URL}/users/${alexId}`);
    const publicProfileData = await publicProfileRes.json();
    assert(publicProfileRes.status === 200, 'GET /api/users/:id returns 200 OK');
    assert(publicProfileData.data.user.name === 'Alex Rivera', 'Public profile name matches');
    assert(publicProfileData.data.skills.teach.length >= 3, 'Public profile includes teach skills with evidence');
    assert(publicProfileData.data.skills.learn.length >= 2, 'Public profile includes learn skills');

    console.log('\n========================================================');
    console.log(`PHASE 2 BACKEND TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================');

    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
};

runPhase2Tests();
