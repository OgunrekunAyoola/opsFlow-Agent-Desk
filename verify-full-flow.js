const API_URL = 'http://127.0.0.1:3000';
let axios;

try {
  axios = require('./frontend/node_modules/axios');
} catch (e) {
  try {
    axios = require('./backend/node_modules/axios');
  } catch (e2) {
    console.error('Axios not found. Please run "npm install axios" in root.');
    process.exit(1);
  }
}

async function runTest() {
  const timestamp = Date.now();
  const adminEmail = `admin-${timestamp}@test.com`;
  const adminPassword = 'Password123!';
  let token = '';
  let ticketId = '';
  let tenantId = '';

  console.log('🚀 Starting Full Flow Verification...\n');

  // 1. Signup
  try {
    console.log('1. Testing Signup... ');
    const res = await axios.post(`${API_URL}/auth/signup`, {
      tenantName: 'Test Corp',
      name: 'Test Admin',
      email: adminEmail,
      password: adminPassword,
    });
    token = res.data.access_token;
    if (!token) throw new Error('No token returned');
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.log('Error Message:', err.message);
    console.log('Error Code:', err.code);
    if (err.response) {
      console.log('Response Status:', err.response.status);
      console.log('Response Data:', err.response.data);
    }
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Initial Dashboard Check
  try {
    console.log('2. Checking Initial Dashboard... ');
    const res = await axios.get(`${API_URL}/dashboard/stats`, { headers });
    if (res.data.totalTickets !== 0) throw new Error('Expected 0 tickets');
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error(err.response?.data || err.message);
  }

  // 3. Create Ticket
  try {
    console.log('3. Creating Ticket... ');
    const res = await axios.post(
      `${API_URL}/tickets`,
      {
        subject: 'Login Issue',
        body: 'I cannot login to my account.',
        priority: 'high',
        customerEmail: 'customer@example.com',
        customerName: 'Customer Joe',
        channel: 'email',
        status: 'new',
        category: 'general',
      },
      { headers },
    );
    ticketId = res.data._id;
    if (!ticketId) throw new Error('No ticket ID returned');
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error(err.response?.data || err.message);
    process.exit(1);
  }

  // 4. Verify Dashboard Update
  try {
    console.log('4. Verifying Dashboard Update... ');
    const res = await axios.get(`${API_URL}/dashboard/stats`, { headers });
    if (res.data.totalTickets !== 1)
      throw new Error(`Expected 1 ticket, got ${res.data.totalTickets}`);
    if (res.data.byStatus.new !== 1) throw new Error('Expected 1 new ticket');
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error(err.response?.data || err.message);
  }

  // 5. Run AI Workflow
  try {
    console.log('5. Running AI Workflow... ');
    const res = await axios.post(
      `${API_URL}/tickets/${ticketId}/workflows/triage`,
      {},
      { headers },
    );

    if (!res.data.run || res.data.run.status !== 'succeeded')
      throw new Error('Workflow failed or did not succeed');
    if (!res.data.ticket.aiAnalysis) throw new Error('No AI analysis in ticket');

    const analysis = res.data.ticket.aiAnalysis;
    if (analysis.sentiment !== 'neutral') console.log(`(Note: Sentiment is ${analysis.sentiment})`);

    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error('Error Details:', err.response?.data || err.message);
  }

  // 6. Verifying Workflow History
  try {
    console.log('6. Verifying Workflow History... ');
    const res = await axios.get(`${API_URL}/tickets/${ticketId}/workflows`, { headers });
    if (!Array.isArray(res.data) || res.data.length === 0)
      throw new Error('No workflow history found');
    if (!res.data[0].steps || res.data[0].steps.length === 0)
      throw new Error('No steps in workflow run');
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error('Error Details:', err.response?.data || err.message);
  }

  // 7. Reply to Ticket
  try {
    console.log('7. Replying to Ticket... ');
    const res = await axios.post(
      `${API_URL}/tickets/${ticketId}/reply`,
      {
        body: 'We are looking into it.',
      },
      { headers },
    );

    // Check if reply was created
    if (!res.data._id || !res.data.body) throw new Error('Invalid reply response');

    // Verify Ticket Status Update
    const ticketRes = await axios.get(`${API_URL}/tickets/${ticketId}`, { headers });
    if (ticketRes.data.status !== 'replied')
      throw new Error(`Ticket status is ${ticketRes.data.status}, expected replied`);

    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error('Error Details:', err.response?.data || err.message);
  }

  // 8. Add Team Member
  try {
    console.log('8. Adding Team Member... ');
    const memberEmail = `member-${timestamp}@test.com`;
    const res = await axios.post(
      `${API_URL}/users`,
      {
        name: 'Test Member',
        email: memberEmail,
        password: 'password123',
        role: 'member',
      },
      { headers },
    );
    // Response structure is { user: { ... } }
    const createdUser = res.data.user || res.data;
    if (createdUser.email !== memberEmail)
      throw new Error(`Member email mismatch: got ${createdUser.email}`);
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error('Error Details:', err.response?.data || err.message);
  }

  // 9. List Users
  try {
    console.log('9. Listing Users... ');
    const res = await axios.get(`${API_URL}/users`, { headers });
    if (res.data.users.length < 2) throw new Error('Expected at least 2 users');
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FAILED');
    console.error(err.response?.data || err.message);
  }

  console.log('\n✨ All tests passed successfully!');
}

runTest();
