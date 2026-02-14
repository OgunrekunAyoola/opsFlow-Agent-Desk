const API_URL = 'http://127.0.0.1:3000';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function run() {
  console.log('AI Flow Test');
  const ts = Date.now();
  const adminEmail = `admin-${ts}@test.com`;
  const adminPassword = 'Password123!';

  // Signup and auth header
  const signup = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'AiFlow Corp',
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });
  const token = signup.data.access_token;
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // Create ticket
  const t = await axios.post(
    `${API_URL}/tickets`,
    {
      subject: 'AI Triage Needed',
      body: 'System error when logging in.',
      priority: 'high',
      customerEmail: 'customer@example.com',
      customerName: 'Cust',
      channel: 'email',
      status: 'new',
      category: 'general',
    },
    auth,
  );
  const ticketId = t.data._id;
  if (!ticketId) throw new Error('ticket create failed');

  // Run AI triage workflow
  const wf = await axios.post(`${API_URL}/tickets/${ticketId}/workflows/triage`, {}, auth);
  if (wf.data.run?.status !== 'succeeded') throw new Error('workflow failed');
  if (!wf.data.ticket?.aiAnalysis) throw new Error('aiAnalysis missing');

  // Verify workflow history exists
  const hist = await axios.get(`${API_URL}/tickets/${ticketId}/workflows`, auth);
  if (!Array.isArray(hist.data) || hist.data.length < 1) throw new Error('workflow history missing');
  if (!hist.data[0].steps || hist.data[0].steps.length < 1) throw new Error('workflow steps missing');

  console.log('AI Flow OK');
}

module.exports = { run };
