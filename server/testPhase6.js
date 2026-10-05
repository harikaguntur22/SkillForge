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
  return { status: res.status, ok: res.ok, data };
};

const runPhase6Tests = async () => {
  console.log('======================================================');
  console.log('🚀 RUNNING PHASE 6: PROJECT COLLABORATION & TEAMS TESTS');
  console.log('======================================================\n');

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

  // 1. Authenticate test users
  const alexLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'alex.rivera@mit.edu', password: 'Alex@123456' }),
  });
  assert.strictEqual(alexLogin.status, 200, 'Alex login should succeed');
  const alexToken = alexLogin.data.data.token;
  const alexId = alexLogin.data.data.user._id;
  const alexAuth = { Authorization: `Bearer ${alexToken}` };

  const priyaLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'priya.patel@stanford.edu', password: 'Priya@123456' }),
  });
  assert.strictEqual(priyaLogin.status, 200, 'Priya login should succeed');
  const priyaToken = priyaLogin.data.data.token;
  const priyaId = priyaLogin.data.data.user._id;
  const priyaAuth = { Authorization: `Bearer ${priyaToken}` };

  const marcusLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'marcus.chen@mit.edu', password: 'Marcus@123456' }),
  });
  assert.strictEqual(marcusLogin.status, 200, 'Marcus login should succeed');
  const marcusToken = marcusLogin.data.data.token;
  const marcusId = marcusLogin.data.data.user._id;
  const marcusAuth = { Authorization: `Bearer ${marcusToken}` };

  // Fetch a project created by Alex (e.g. ForgePulse)
  const alexProjectsRes = await request(`/projects?creator=${alexId}`, { headers: alexAuth });
  assert.strictEqual(alexProjectsRes.status, 200);
  const forgePulse = alexProjectsRes.data.data.find((p) => p.title.includes('ForgePulse')) || alexProjectsRes.data.data[0];
  assert.ok(forgePulse, 'ForgePulse project should exist');
  const projectId = forgePulse._id;

  // 2. Test defining team size, required roles, and required skills on project creation
  let createdProjectId;
  await test('Creator can define team size, required roles, and required skills on project creation', async () => {
    // Get canonical skills
    const skillsRes = await request('/skills');
    const reactSkill = skillsRes.data.data.skills.find((s) => s.name === 'React');
    const nodeSkill = skillsRes.data.data.skills.find((s) => s.name === 'Node.js');

    const newProjectPayload = {
      title: 'Real-Time Collaboration Platform Alpha',
      tagline: 'Team collaboration workspace with live cursors and audio channels',
      description: 'An advanced real-time collaboration suite requiring dedicated React and Node.js engineers.',
      category: 'Web Development',
      difficulty: 'INTERMEDIATE',
      estimatedDuration: '6 weeks',
      teamSize: 3,
      requiredSkills: [
        { skillId: reactSkill._id, name: 'React', level: 'INTERMEDIATE', isMandatory: true },
        { skillId: nodeSkill._id, name: 'Node.js', level: 'INTERMEDIATE', isMandatory: true },
      ],
      requiredRoles: [
        { roleName: 'React Developer', skills: ['React'], spots: 1 },
        { roleName: 'Node.js Developer', skills: ['Node.js'], spots: 1 },
        { roleName: 'UI/UX Designer', skills: ['React'], spots: 1 },
      ],
      deliverables: ['WebSocket architecture', 'Canvas UI', 'Room management'],
      tags: ['React', 'Node.js', 'Collaboration'],
    };

    const res = await request('/projects', {
      method: 'POST',
      headers: alexAuth,
      body: JSON.stringify(newProjectPayload),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.teamSize, 3);
    assert.strictEqual(res.data.data.requiredRoles.length, 3);
    assert.ok(res.data.data.members.length >= 1, 'Creator must be added to initial team members');
    assert.strictEqual(res.data.data.members[0].role, 'Project Lead');
    createdProjectId = res.data.data._id;
  });

  // 3. Test Collaborator Recommendations
  await test('Collaborator recommendations: Recommends candidates matching required roles with explainable reason', async () => {
    const res = await request(`/projects/${projectId}/collaborators/recommended`, {
      headers: alexAuth,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.roleRecommendations, 'Must return roleRecommendations');

    // Find recommendation for React Developer role
    const reactRoleRec = res.data.data.roleRecommendations.find(
      (r) => r.role.roleName === 'React Developer'
    );
    assert.ok(reactRoleRec, 'Must have recommendations for React Developer');

    // Priya knows React, so Priya should be top recommended for React Developer
    const topCandidate = reactRoleRec.recommendedCandidates[0];
    assert.ok(topCandidate, 'Should have candidate for React Developer');
    assert.strictEqual(
      topCandidate.candidate._id.toString(),
      priyaId.toString(),
      'Priya should be top candidate for React Developer'
    );
    assert.ok(topCandidate.score >= 70, `Score (${topCandidate.score}) should be >= 70`);
    assert.ok(
      typeof topCandidate.recommendationReason === 'string' && topCandidate.recommendationReason.includes('Priya'),
      'Must include explainable recommendationReason mentioning Priya'
    );
    assert.ok(
      topCandidate.matchedSkills.some((s) => s.name === 'React'),
      'Priya should match React'
    );
  });

  // 4. Test Invite Collaborator (Alex invites Priya for React Developer role)
  let inviteId;
  await test('Creator can invite collaborator for a specific role', async () => {
    const res = await request(`/projects/${projectId}/collaborators/invite`, {
      method: 'POST',
      headers: alexAuth,
      body: JSON.stringify({
        candidateUserId: priyaId,
        role: 'React Developer',
        message: 'Hi Priya, we would love your React expertise on ForgePulse!',
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.type, 'INVITE');
    assert.strictEqual(res.data.data.status, 'PENDING');
    assert.strictEqual(res.data.data.role, 'React Developer');
    inviteId = res.data.data._id;
  });

  // 5. Prevent duplicate pending invite
  await test('Prevent duplicate pending invitation to the same candidate', async () => {
    const res = await request(`/projects/${projectId}/collaborators/invite`, {
      method: 'POST',
      headers: alexAuth,
      body: JSON.stringify({
        candidateUserId: priyaId,
        role: 'React Developer',
      }),
    });
    assert.strictEqual(res.status, 409, 'Duplicate invite should return 409 Conflict');
  });

  // 6. Test Join Request (Marcus requests to join ForgePulse)
  let joinRequestId;
  await test('Student can submit a join request for an open role', async () => {
    const res = await request(`/projects/${projectId}/collaborators/join`, {
      method: 'POST',
      headers: marcusAuth,
      body: JSON.stringify({
        role: 'Node.js Developer',
        message: 'Hey Alex, I want to contribute to the WebSocket server architecture.',
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.type, 'JOIN_REQUEST');
    assert.strictEqual(res.data.data.status, 'PENDING');
    joinRequestId = res.data.data._id;
  });

  // 7. Prevent duplicate pending join request
  await test('Prevent duplicate pending join request from same applicant', async () => {
    const res = await request(`/projects/${projectId}/collaborators/join`, {
      method: 'POST',
      headers: marcusAuth,
      body: JSON.stringify({
        role: 'Node.js Developer',
      }),
    });
    assert.strictEqual(res.status, 409, 'Duplicate join request should return 409 Conflict');
  });

  // 8. Fetch Collaboration Requests (Inbox / Outbox)
  await test('User can view their incoming invites and outgoing join requests', async () => {
    // Priya checks her received invitations
    const priyaInbox = await request('/collaborations/my-requests', { headers: priyaAuth });
    assert.strictEqual(priyaInbox.status, 200);
    assert.ok(
      priyaInbox.data.data.invitesReceived.some((inv) => inv._id.toString() === inviteId.toString()),
      'Priya must see Alex invite in invitesReceived'
    );

    // Marcus checks his sent join requests
    const marcusOutbox = await request('/collaborations/my-requests', { headers: marcusAuth });
    assert.strictEqual(marcusOutbox.status, 200);
    assert.ok(
      marcusOutbox.data.data.joinRequestsSent.some((req) => req._id.toString() === joinRequestId.toString()),
      'Marcus must see join request in joinRequestsSent'
    );
  });

  // 9. Accept Invitation (Priya accepts Alex's invitation)
  await test('Invited collaborator can ACCEPT the invitation and join team', async () => {
    const res = await request(`/collaborations/${inviteId}/respond`, {
      method: 'PUT',
      headers: priyaAuth,
      body: JSON.stringify({
        action: 'ACCEPT',
        responseMessage: 'Excited to build the canvas UI!',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'ACCEPTED');

    // Verify Priya is now an active member in project members
    const membersRes = await request(`/projects/${projectId}/members`);
    assert.strictEqual(membersRes.status, 200);
    const activeMembers = membersRes.data.data.members;
    const priyaMember = activeMembers.find(
      (m) => (m.userId._id || m.userId).toString() === priyaId.toString()
    );
    assert.ok(priyaMember, 'Priya must now be an active team member');
    assert.strictEqual(priyaMember.role, 'React Developer');
  });

  // 10. Reject Join Request (Alex rejects Marcus's join request)
  await test('Project creator can REJECT a join request', async () => {
    const res = await request(`/collaborations/${joinRequestId}/respond`, {
      method: 'PUT',
      headers: alexAuth,
      body: JSON.stringify({
        action: 'REJECT',
        responseMessage: 'Sorry Marcus, this spot is currently reserved.',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.status, 'REJECTED');
  });

  // 11. Update team member role (Alex updates Priya's role)
  await test('Project creator can update a team member role', async () => {
    const res = await request(`/projects/${projectId}/members/${priyaId}/role`, {
      method: 'PUT',
      headers: alexAuth,
      body: JSON.stringify({
        role: 'Lead Frontend Architect',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    const updatedMember = res.data.data.members.find(
      (m) => (m.userId._id || m.userId).toString() === priyaId.toString()
    );
    assert.strictEqual(updatedMember.role, 'Lead Frontend Architect');
  });

  // 12. Non-creator cannot update member role (403 Forbidden)
  await test('Non-creator cannot update member role (403 Forbidden)', async () => {
    const res = await request(`/projects/${projectId}/members/${alexId}/role`, {
      method: 'PUT',
      headers: priyaAuth,
      body: JSON.stringify({
        role: 'Intern',
      }),
    });
    assert.strictEqual(res.status, 403, 'Should be 403 Forbidden');
  });

  // 13. Remove member (Alex removes Priya)
  await test('Project creator can remove a team member', async () => {
    const res = await request(`/projects/${projectId}/members/${priyaId}`, {
      method: 'DELETE',
      headers: alexAuth,
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    // Verify Priya is no longer in active members
    const membersRes = await request(`/projects/${projectId}/members`);
    const isPriyaActive = membersRes.data.data.members.some(
      (m) => (m.userId._id || m.userId).toString() === priyaId.toString()
    );
    assert.strictEqual(isPriyaActive, false, 'Priya must not be in active members');
  });

  // 14. Cannot remove project creator (400 Bad Request)
  await test('Project creator cannot remove themselves (400 Bad Request)', async () => {
    const res = await request(`/projects/${projectId}/members/${alexId}`, {
      method: 'DELETE',
      headers: alexAuth,
    });
    assert.strictEqual(res.status, 400, 'Should return 400 Bad Request');
  });

  // 15. Leave project flow
  await test('Active member can voluntarily leave a project', async () => {
    // Re-invite and accept Priya into created project
    const inviteRes = await request(`/projects/${createdProjectId}/collaborators/invite`, {
      method: 'POST',
      headers: alexAuth,
      body: JSON.stringify({
        candidateUserId: priyaId,
        role: 'React Developer',
      }),
    });
    assert.strictEqual(inviteRes.status, 201);
    const newInviteId = inviteRes.data.data._id;

    const acceptRes = await request(`/collaborations/${newInviteId}/respond`, {
      method: 'PUT',
      headers: priyaAuth,
      body: JSON.stringify({ action: 'ACCEPT' }),
    });
    assert.strictEqual(acceptRes.status, 200);

    // Priya leaves the project
    const leaveRes = await request(`/projects/${createdProjectId}/leave`, {
      method: 'POST',
      headers: priyaAuth,
    });
    assert.strictEqual(leaveRes.status, 200);
    assert.strictEqual(leaveRes.data.success, true);

    // Verify Priya is no longer an active member
    const membersRes = await request(`/projects/${createdProjectId}/members`);
    const isPriyaActive = membersRes.data.data.members.some(
      (m) => (m.userId._id || m.userId).toString() === priyaId.toString()
    );
    assert.strictEqual(isPriyaActive, false, 'Priya should no longer be active member');
  });

  // Clean up created project
  await request(`/projects/${createdProjectId}`, {
    method: 'DELETE',
    headers: alexAuth,
  });

  console.log('\n======================================================');
  console.log(`📊 PHASE 6 TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
};

runPhase6Tests();
