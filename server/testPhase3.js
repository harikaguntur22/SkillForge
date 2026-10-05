// Automated test script for Phase 3: Skill Exchange & Bilateral Matching
const BASE_URL = 'http://localhost:5000/api';

const runPhase3Tests = async () => {
  console.log('========================================================');
  console.log('SKILLFORGE PHASE 3 AUTOMATED TEST SUITE');
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
    // 1. AUTHENTICATE 3 SAMPLE USERS
    console.log('--- TEST 1: Authenticate Sample Users ---');
    const loginUser = async (email, password) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { token: data.data.token, user: data.data.user };
    };

    const alex = await loginUser('alex.rivera@mit.edu', 'Alex@123456');
    const priya = await loginUser('priya.patel@stanford.edu', 'Priya@123456');
    const marcus = await loginUser('marcus.chen@mit.edu', 'Marcus@123456');

    assert(!!alex.token, 'Alex authenticated');
    assert(!!priya.token, 'Priya authenticated');
    assert(!!marcus.token, 'Marcus authenticated');

    // 2. BILATERAL MATCHING ENGINE
    console.log('\n--- TEST 2: Bilateral Matching Engine (Find Matches for Alex) ---');
    const matchesRes = await fetch(`${BASE_URL}/skill-exchange/matches`, {
      headers: { Authorization: `Bearer ${alex.token}` },
    });
    const matchesData = await matchesRes.json();
    assert(matchesRes.status === 200, 'GET /api/skill-exchange/matches returns 200 OK');
    assert(matchesData.data.matches.length >= 2, `Found ${matchesData.data.matches.length} compatible peer matches for Alex`);

    // Check match with Priya
    const priyaMatch = matchesData.data.matches.find(
      (m) => m.peer.name === 'Priya Patel' || m.peer.email === 'priya.patel@stanford.edu'
    );
    assert(!!priyaMatch, 'Alex matched with Priya');
    assert(priyaMatch.compatibilityScore >= 70, `Compatibility score with Priya is high (${priyaMatch?.compatibilityScore}%)`);
    assert(priyaMatch.matchType === 'MUTUAL', "Match type is 'MUTUAL' (Alex teaches Python, Priya teaches React)");
    assert(priyaMatch.matchReasons.length > 0, `Match explanation provided: "${priyaMatch?.matchReasons[0]}"`);

    // Check match with Marcus
    const marcusMatch = matchesData.data.matches.find(
      (m) => m.peer.name === 'Marcus Chen' || m.peer.email === 'marcus.chen@mit.edu'
    );
    assert(!!marcusMatch, 'Alex matched with Marcus');
    assert(marcusMatch.compatibilityScore >= 80, `Compatibility score with Marcus is ${marcusMatch?.compatibilityScore}% (MIT campus boost)`);

    // 3. SEND SKILL EXCHANGE REQUEST (Alex -> Priya)
    console.log('\n--- TEST 3: Send Skill Exchange Request (Alex -> Priya) ---');
    const sendReqRes = await fetch(`${BASE_URL}/skill-exchange/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alex.token}`,
      },
      body: JSON.stringify({
        receiverId: priya.user._id,
        message: "Hi Priya! I'd love to learn React component architecture from you and can teach you Python/FastAPI in return!",
      }),
    });
    const sendReqData = await sendReqRes.json();
    assert(sendReqRes.status === 201, 'POST /api/skill-exchange/requests returns 201 Created');
    assert(sendReqData.data.request.status === 'PENDING', "Created request has status 'PENDING'");
    const exchangeRequestId = sendReqData.data.request._id;

    // 4. PREVENT DUPLICATE PENDING REQUEST
    console.log('\n--- TEST 4: Prevent Duplicate Pending Request ---');
    const dupReqRes = await fetch(`${BASE_URL}/skill-exchange/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alex.token}`,
      },
      body: JSON.stringify({
        receiverId: priya.user._id,
        message: 'Duplicate request test',
      }),
    });
    assert(dupReqRes.status === 409, 'Duplicate request correctly rejected with 409 Conflict');

    // 5. FETCH REQUESTS (INCOMING FOR PRIYA)
    console.log('\n--- TEST 5: Fetch Requests for Priya ---');
    const priyaReqsRes = await fetch(`${BASE_URL}/skill-exchange/requests`, {
      headers: { Authorization: `Bearer ${priya.token}` },
    });
    const priyaReqsData = await priyaReqsRes.json();
    assert(priyaReqsRes.status === 200, 'GET /api/skill-exchange/requests returns 200 OK');
    const incomingFromAlex = priyaReqsData.data.incoming.find((r) => r.senderId.email === 'alex.rivera@mit.edu');
    assert(!!incomingFromAlex, 'Priya sees incoming exchange request from Alex');

    // 6. ACCEPT REQUEST (Priya accepts Alex)
    console.log('\n--- TEST 6: Accept Exchange Request ---');
    const acceptRes = await fetch(`${BASE_URL}/skill-exchange/requests/${exchangeRequestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${priya.token}`,
      },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.status === 200, 'PUT /api/skill-exchange/requests/:id returns 200 OK');
    assert(acceptData.data.request.status === 'ACCEPTED', "Request status updated to 'ACCEPTED'");

    // 7. SCHEDULE LEARNING SESSION
    console.log('\n--- TEST 7: Schedule Learning Session ---');
    const skillsRes = await fetch(`${BASE_URL}/skills?search=React`);
    const skillsData = await skillsRes.json();
    const reactSkillId = skillsData.data.skills[0]._id;

    const sessionDate = new Date(Date.now() + 86400000 * 3).toISOString(); // 3 days from now
    const scheduleRes = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${priya.token}`,
      },
      body: JSON.stringify({
        exchangeRequestId,
        mentorId: priya.user._id,
        learnerId: alex.user._id,
        skillId: reactSkillId,
        scheduledAt: sessionDate,
        durationMinutes: 60,
        meetingUrl: 'https://meet.google.com/priya-alex-react',
        mentorNotes: 'Topics: Custom hooks, Context API, component performance optimization.',
      }),
    });
    const scheduleData = await scheduleRes.json();
    assert(scheduleRes.status === 201, 'POST /api/sessions returns 201 Created');
    assert(scheduleData.data.session.status === 'SCHEDULED', "Session status is 'SCHEDULED'");
    const sessionId = scheduleData.data.session._id;

    // 8. FETCH SESSIONS FOR ALEX
    console.log('\n--- TEST 8: Fetch Sessions for Alex ---');
    const alexSessionsRes = await fetch(`${BASE_URL}/sessions`, {
      headers: { Authorization: `Bearer ${alex.token}` },
    });
    const alexSessionsData = await alexSessionsRes.json();
    assert(alexSessionsRes.status === 200, 'GET /api/sessions returns 200 OK');
    const foundSession = alexSessionsData.data.sessions.find((s) => s._id === sessionId);
    assert(!!foundSession, 'Scheduled session appears in Alex session list');

    // 9. COMPLETE SESSION & SUBMIT FEEDBACK
    console.log('\n--- TEST 9: Complete Session & Submit Rating/Feedback ---');
    const feedbackRes = await fetch(`${BASE_URL}/sessions/${sessionId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alex.token}`,
      },
      body: JSON.stringify({
        rating: 5,
        review: 'Exceptional mentor! Explained advanced React hooks and performance optimization with real code examples.',
      }),
    });
    const feedbackData = await feedbackRes.json();
    assert(feedbackRes.status === 200, 'POST /api/sessions/:id/feedback returns 200 OK');
    assert(feedbackData.data.session.status === 'COMPLETED', "Session marked as 'COMPLETED'");
    assert(feedbackData.data.session.learnerFeedback.rating === 5, 'Learner rating recorded as 5 stars');

    // 10. TEST CANCEL REQUEST WORKFLOW (Marcus -> Priya -> Cancel)
    console.log('\n--- TEST 10: Cancellation Flow (Marcus -> Priya -> Cancel) ---');
    const marcusReqRes = await fetch(`${BASE_URL}/skill-exchange/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${marcus.token}`,
      },
      body: JSON.stringify({
        receiverId: priya.user._id,
        message: 'Request to test cancellation',
      }),
    });
    const marcusReqData = await marcusReqRes.json();
    const marcusReqId = marcusReqData.data.request._id;

    const cancelRes = await fetch(`${BASE_URL}/skill-exchange/requests/${marcusReqId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${marcus.token}`,
      },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200, 'Cancellation returns 200 OK');
    assert(cancelData.data.request.status === 'CANCELLED', "Request status updated to 'CANCELLED'");

    // 11. TEST REJECT REQUEST WORKFLOW (Marcus -> Alex -> Reject)
    console.log('\n--- TEST 11: Rejection Flow (Marcus -> Alex -> Reject) ---');
    const marcusAlexReqRes = await fetch(`${BASE_URL}/skill-exchange/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${marcus.token}`,
      },
      body: JSON.stringify({
        receiverId: alex.user._id,
        message: 'Request to test rejection',
      }),
    });
    const marcusAlexReqData = await marcusAlexReqRes.json();
    const marcusAlexReqId = marcusAlexReqData.data.request._id;

    const rejectRes = await fetch(`${BASE_URL}/skill-exchange/requests/${marcusAlexReqId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${alex.token}`,
      },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    const rejectData = await rejectRes.json();
    assert(rejectRes.status === 200, 'Rejection returns 200 OK');
    assert(rejectData.data.request.status === 'REJECTED', "Request status updated to 'REJECTED'");

    console.log('\n========================================================');
    console.log(`PHASE 3 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('========================================================');

    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
};

runPhase3Tests();
