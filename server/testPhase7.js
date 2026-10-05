import http from 'http';

function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function loginUser(email, password) {
  const res = await makeRequest({
    method: 'POST',
    path: '/api/auth/login',
    body: { email, password },
  });
  if (res.status !== 200 || !res.body.data?.token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.body)}`);
  }
  return {
    token: res.body.data.token,
    user: res.body.data.user,
  };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runPhase7Tests() {
  console.log('\n======================================================');
  console.log('🚀 RUNNING PHASE 7: PROJECT WORKSPACE & KANBAN TESTS');
  console.log('======================================================\n');

  try {
    // 1. Authenticate users
    const alex = await loginUser('alex.rivera@mit.edu', 'Alex@123456');
    const priya = await loginUser('priya.patel@stanford.edu', 'Priya@123456');
    const marcus = await loginUser('marcus.chen@mit.edu', 'Marcus@123456');

    const alexHeaders = { Authorization: `Bearer ${alex.token}` };
    const priyaHeaders = { Authorization: `Bearer ${priya.token}` };
    const marcusHeaders = { Authorization: `Bearer ${marcus.token}` };

    // Fetch canonical skills for IDs
    const skillsRes = await makeRequest({ method: 'GET', path: '/api/skills' });
    const skillsList = skillsRes.body.data.skills || [];
    const reactSkill = skillsList.find((s) => s.name === 'React');
    const nodeSkill = skillsList.find((s) => s.name === 'Node.js');
    const mongoSkill = skillsList.find((s) => s.name === 'MongoDB');

    // 2. Create a test project owned by Alex with Priya as a member
    const projRes = await makeRequest({
      method: 'POST',
      path: '/api/projects',
      headers: alexHeaders,
      body: {
        title: 'Phase 7 Workspace Matrix Platform',
        tagline: 'Collaborative development platform with full workspace',
        description: 'Complete project to test Kanban board, milestones, discussions, and skill evidence.',
        category: 'Web Development',
        difficulty: 'INTERMEDIATE',
        estimatedDuration: '4 weeks',
        teamSize: 4,
        requiredSkills: [
          { skillId: reactSkill._id, name: 'React', level: 'INTERMEDIATE', isMandatory: true },
          { skillId: nodeSkill._id, name: 'Node.js', level: 'INTERMEDIATE', isMandatory: true },
          { skillId: mongoSkill._id, name: 'MongoDB', level: 'INTERMEDIATE', isMandatory: true },
        ],
        requiredRoles: [
          { roleName: 'Frontend Engineer', skills: ['React'], spots: 2 },
          { roleName: 'Backend Engineer', skills: ['Node.js', 'MongoDB'], spots: 2 },
        ],
      },
    });

    assert(projRes.status === 201, 'Alex creates test project for Phase 7 workspace');
    const projectId = projRes.body.data._id;

    // Add Priya to the team via invite & accept flow
    const inviteRes = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/collaborators/invite`,
      headers: alexHeaders,
      body: {
        candidateUserId: priya.user._id,
        role: 'Frontend Engineer',
        message: 'Join us on the Workspace Matrix project!',
      },
    });
    assert(inviteRes.status === 201, 'Alex invites Priya to the project team');
    const invitationId = inviteRes.body.data._id;

    const acceptRes = await makeRequest({
      method: 'PUT',
      path: `/api/collaborations/${invitationId}/respond`,
      headers: priyaHeaders,
      body: { action: 'ACCEPT' },
    });
    assert(acceptRes.status === 200, 'Priya accepts invitation to join team');

    // 3. Authorization check: Marcus is not a member, access to workspace should be 403
    const marcusWorkspaceRes = await makeRequest({
      method: 'GET',
      path: `/api/projects/${projectId}/workspace`,
      headers: marcusHeaders,
    });
    assert(
      marcusWorkspaceRes.status === 403,
      'Non-member (Marcus) cannot access project workspace (403 Forbidden)'
    );

    // 4. Access check: Alex (creator) and Priya (member) can access workspace
    const alexWorkspaceRes = await makeRequest({
      method: 'GET',
      path: `/api/projects/${projectId}/workspace`,
      headers: alexHeaders,
    });
    assert(alexWorkspaceRes.status === 200, 'Alex (creator) can access workspace');
    assert(
      alexWorkspaceRes.body.data.isCreator === true,
      'Workspace correctly identifies Alex as creator'
    );
    assert(
      alexWorkspaceRes.body.data.progress.percentage === 0,
      'Initial progress percentage is 0%'
    );

    const priyaWorkspaceRes = await makeRequest({
      method: 'GET',
      path: `/api/projects/${projectId}/workspace`,
      headers: priyaHeaders,
    });
    assert(priyaWorkspaceRes.status === 200, 'Priya (team member) can access workspace');
    assert(
      priyaWorkspaceRes.body.data.isCreator === false,
      'Workspace correctly identifies Priya as collaborator'
    );

    // 5. Milestone Management
    const milestoneRes = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/workspace/milestones`,
      headers: alexHeaders,
      body: {
        title: 'Alpha Architecture Release',
        description: 'Design the schema, setup database and API routes',
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'PLANNED',
      },
    });
    assert(milestoneRes.status === 201, 'Create milestone in project workspace');
    const milestoneId = milestoneRes.body.data.milestone._id;

    // 6. Task Management: Create tasks across Kanban statuses
    // Task 1: TODO
    const task1Res = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/workspace/tasks`,
      headers: alexHeaders,
      body: {
        title: 'Design MongoDB collections and schemas',
        description: 'Create Task, Milestone, Discussion, Resource schemas',
        status: 'TODO',
        priority: 'HIGH',
        assigneeId: alex.user._id,
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        milestoneId,
      },
    });
    assert(task1Res.status === 201, 'Create task in TODO column with assignee and priority');
    const task1Id = task1Res.body.data.task._id;

    // Task 2: Assign to Priya
    const task2Res = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/workspace/tasks`,
      headers: alexHeaders,
      body: {
        title: 'Build React Kanban task board UI',
        description: 'Columns: TODO, IN_PROGRESS, REVIEW, DONE with status shift',
        status: 'TODO',
        priority: 'URGENT',
        assigneeId: priya.user._id,
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      },
    });
    assert(task2Res.status === 201, 'Assign task to Priya with URGENT priority');
    const task2Id = task2Res.body.data.task._id;

    // 7. Update Task Status & verify Kanban transitions
    // Move task 2 to IN_PROGRESS
    const moveInProgressRes = await makeRequest({
      method: 'PATCH',
      path: `/api/projects/${projectId}/workspace/tasks/${task2Id}/status`,
      headers: priyaHeaders,
      body: { status: 'IN_PROGRESS' },
    });
    assert(
      moveInProgressRes.status === 200 && moveInProgressRes.body.data.task.status === 'IN_PROGRESS',
      'Move task status from TODO to IN_PROGRESS'
    );

    // Move task 2 to REVIEW
    const moveReviewRes = await makeRequest({
      method: 'PATCH',
      path: `/api/projects/${projectId}/workspace/tasks/${task2Id}/status`,
      headers: priyaHeaders,
      body: { status: 'REVIEW' },
    });
    assert(
      moveReviewRes.status === 200 && moveReviewRes.body.data.task.status === 'REVIEW',
      'Move task status from IN_PROGRESS to REVIEW'
    );

    // Move task 2 to DONE
    const moveDoneRes = await makeRequest({
      method: 'PATCH',
      path: `/api/projects/${projectId}/workspace/tasks/${task2Id}/status`,
      headers: alexHeaders,
      body: { status: 'DONE' },
    });
    assert(
      moveDoneRes.status === 200 && moveDoneRes.body.data.task.status === 'DONE',
      'Move task status from REVIEW to DONE'
    );

    // Check project progress calculation: 1 out of 2 tasks completed = 50%
    const progressCheck = await makeRequest({
      method: 'GET',
      path: `/api/projects/${projectId}/workspace`,
      headers: alexHeaders,
    });
    assert(
      progressCheck.body.data.progress.percentage === 50,
      'Project progress dynamically updates to 50% (1/2 tasks done)'
    );

    // Move task 1 to DONE as well -> 100%
    await makeRequest({
      method: 'PATCH',
      path: `/api/projects/${projectId}/workspace/tasks/${task1Id}/status`,
      headers: alexHeaders,
      body: { status: 'DONE' },
    });

    const progress100Check = await makeRequest({
      method: 'GET',
      path: `/api/projects/${projectId}/workspace`,
      headers: alexHeaders,
    });
    assert(
      progress100Check.body.data.progress.percentage === 100,
      'Project progress reaches 100% when all tasks are DONE'
    );

    // 8. Project Discussions & Thread Replies
    const discussRes = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/workspace/discussions`,
      headers: priyaHeaders,
      body: {
        title: 'Component Library & Design Tokens',
        message: 'Should we use Tailwind CSS transitions or Framer Motion for card drag animations?',
        category: 'TECHNICAL',
      },
    });
    assert(discussRes.status === 201, 'Post team discussion topic');
    const discussionId = discussRes.body.data.discussion._id;

    const replyRes = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/workspace/discussions/${discussionId}/replies`,
      headers: alexHeaders,
      body: {
        message: 'Tailwind transitions with clean SVG icons keep the bundle light and ultra responsive!',
      },
    });
    assert(
      replyRes.status === 201 && replyRes.body.data.discussion.replies.length === 1,
      'Alex replies to team discussion thread'
    );

    // 9. Project Resources
    const resourceRes = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/workspace/resources`,
      headers: alexHeaders,
      body: {
        title: 'Project Architecture Diagram & API Specs',
        url: 'https://github.com/skillforge/architecture-specs',
        type: 'DOCUMENTATION',
        description: 'Full REST API contract and sequence diagram',
      },
    });
    assert(resourceRes.status === 201, 'Add project resource/link');
    const resourceId = resourceRes.body.data.resource._id;

    // 10. Update Workspace Settings (GitHub URL, Demo URL, Project Status)
    const settingsRes = await makeRequest({
      method: 'PUT',
      path: `/api/projects/${projectId}/workspace/settings`,
      headers: alexHeaders,
      body: {
        githubUrl: 'https://github.com/skillforge/workspace-matrix',
        demoUrl: 'https://workspace-matrix.skillforge.dev',
        status: 'COMPLETED',
      },
    });
    assert(
      settingsRes.status === 200 &&
        settingsRes.body.data.project.status === 'COMPLETED' &&
        settingsRes.body.data.project.githubUrl === 'https://github.com/skillforge/workspace-matrix',
      'Creator updates GitHub URL, Demo URL, and marks project COMPLETED'
    );

    // Non-creator cannot update workspace settings (403)
    const nonCreatorSettingsRes = await makeRequest({
      method: 'PUT',
      path: `/api/projects/${projectId}/workspace/settings`,
      headers: priyaHeaders,
      body: { status: 'OPEN' },
    });
    assert(
      nonCreatorSettingsRes.status === 403,
      'Non-creator cannot update project workspace settings (403 Forbidden)'
    );

    // 11. Add Completed Project as Verified Skill Evidence
    const evidenceRes = await makeRequest({
      method: 'POST',
      path: `/api/projects/${projectId}/workspace/claim-evidence`,
      headers: priyaHeaders,
      body: {
        role: 'Frontend Engineer',
        skillNames: ['React'],
        description: 'Engineered responsive React Kanban board and interactive workspace for Workspace Matrix.',
      },
    });
    assert(
      evidenceRes.status === 200 && evidenceRes.body.data.attachedSkillsCount >= 1,
      'Team member (Priya) adds completed project as verified skill evidence'
    );

    // Verify Priya profile skill is now verified with this project attached
    const priyaSkillsRes = await makeRequest({
      method: 'GET',
      path: '/api/user-skills',
      headers: priyaHeaders,
    });
    const priyaReactSkill = priyaSkillsRes.body.data.teach.find(
      (s) => s.skillId.name === 'React'
    );
    assert(
      priyaReactSkill && priyaReactSkill.isVerified === true,
      'Priya React skill is verified with attached project evidence'
    );
    const hasEvidence = priyaReactSkill.evidence.some(
      (e) => e.projectName === 'Phase 7 Workspace Matrix Platform'
    );
    assert(hasEvidence, 'Project name is present in React skill evidence list');

    // 12. Delete operations (Resource & Milestone)
    const delResourceRes = await makeRequest({
      method: 'DELETE',
      path: `/api/projects/${projectId}/workspace/resources/${resourceId}`,
      headers: alexHeaders,
    });
    assert(delResourceRes.status === 200, 'Delete project resource');

    const delMilestoneRes = await makeRequest({
      method: 'DELETE',
      path: `/api/projects/${projectId}/workspace/milestones/${milestoneId}`,
      headers: alexHeaders,
    });
    assert(delMilestoneRes.status === 200, 'Delete project milestone');
  } catch (error) {
    console.error('Test suite failed with error:', error);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`📊 PHASE 7 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests();
