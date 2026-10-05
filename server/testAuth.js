// Automated test script for Phase 1 verification
const BASE_URL = 'http://localhost:5000/api';
const CLIENT_URL = 'http://localhost:5173';

const runTests = async () => {
  console.log('========================================================');
  console.log('SKILLFORGE PHASE 1 AUTOMATED VERIFICATION TEST SUITE');
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
    // TEST 1: System Health & Database Connection
    console.log('--- TEST 1: System Health & MongoDB Connection ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns status 200');
    assert(healthData.success === true, 'Health check response format { success: true }');
    assert(healthData.data.status === 'healthy', 'Database & server status is "healthy"');

    // TEST 2: Registration
    console.log('\n--- TEST 2: User Registration ---');
    const uniqueEmail = `test.student.${Date.now()}@university.edu`;
    const regPayload = {
      name: 'Jordan Lee',
      email: uniqueEmail,
      password: 'JordanPassword123!',
      college: 'Georgia Tech',
      branch: 'Computer Science',
      graduationYear: 2026,
      targetRole: 'Full Stack Engineer',
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regData = await regRes.json();

    assert(regRes.status === 201, 'Registration returns status 201 Created');
    assert(regData.success === true, 'Registration success flag is true');
    assert(!!regData.data.token, 'Registration returns signed JWT token');
    assert(regData.data.user.email === uniqueEmail.toLowerCase(), 'Registered user email matches');
    assert(regData.data.user.passwordHash === undefined, 'Security: passwordHash is not leaked in response');

    // TEST 3: Duplicate Email Registration (Conflict Handling)
    console.log('\n--- TEST 3: Duplicate Email Registration Prevention ---');
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 409, 'Duplicate registration returns status 409 Conflict');
    assert(dupData.success === false, 'Duplicate registration success flag is false');

    // TEST 4: Login with Valid Credentials
    console.log('\n--- TEST 4: User Login (Seeded Demo Account & New User) ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.rivera@mit.edu',
        password: 'Alex@123456',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Seeded user login returns status 200 OK');
    assert(!!loginData.data.token, 'Login returns valid JWT token');
    assert(loginData.data.user.name === 'Alex Rivera', 'Login returns correct user profile');
    assert(loginData.data.user.passwordHash === undefined, 'Security: passwordHash not leaked in login response');

    const authToken = loginData.data.token;

    // TEST 5: Login with Invalid Password
    console.log('\n--- TEST 5: Login with Invalid Credentials ---');
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.rivera@mit.edu',
        password: 'WrongPassword!',
      }),
    });
    assert(badLoginRes.status === 401, 'Invalid password returns status 401 Unauthorized');

    // TEST 6: Protected Route without Token
    console.log('\n--- TEST 6: Protected Route Security Guard ---');
    const unauthRes = await fetch(`${BASE_URL}/auth/me`);
    assert(unauthRes.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // TEST 7: Protected Route with Valid Bearer Token
    console.log('\n--- TEST 7: Protected Route with Valid Bearer Token ---');
    const authMeRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const authMeData = await authMeRes.json();
    assert(authMeRes.status === 200, 'GET /api/auth/me returns 200 OK');
    assert(authMeData.data.user.email === 'alex.rivera@mit.edu', 'Protected profile matches authenticated user');

    // TEST 8: Update Profile via Protected Route
    console.log('\n--- TEST 8: Update User Profile via Protected Route ---');
    const updateRes = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        bio: 'Updated bio during Phase 1 automated test suite.',
        targetRole: 'Senior Full Stack Architect',
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200, 'PUT /api/auth/profile returns 200 OK');
    assert(updateData.data.user.targetRole === 'Senior Full Stack Architect', 'User targetRole updated successfully');

    // TEST 9: Frontend Server Availability
    console.log('\n--- TEST 9: Frontend Vite Server Availability ---');
    const clientRes = await fetch(CLIENT_URL);
    const clientHtml = await clientRes.text();
    assert(clientRes.status === 200, 'Frontend server returns 200 OK');
    assert(clientHtml.includes('SkillForge'), 'Frontend HTML includes "SkillForge" title');

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
};

runTests();
