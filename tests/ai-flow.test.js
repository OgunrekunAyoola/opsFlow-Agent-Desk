const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';
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

  const signup = await axios.post(`${API_URL}/api/auth/sign-up/email`, {
    email: adminEmail,
    password: adminPassword,
    name: 'Admin',
  });
  const setCookie = signup.headers['set-cookie'] || [];
  const cookieHeader = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(';')[0]).join('; ')
    : '';
  const auth = { headers: { Cookie: cookieHeader } };

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
  if (!Array.isArray(hist.data) || hist.data.length < 1)
    throw new Error('workflow history missing');
  if (!hist.data[0].steps || hist.data[0].steps.length < 1)
    throw new Error('workflow steps missing');

  const aiMetrics = await axios.get(`${API_URL}/tickets/ai/metrics`, auth);
  if (!Array.isArray(aiMetrics.data)) throw new Error('ai metrics response is not an array');

  const aiReview = await axios.get(`${API_URL}/tickets/ai/review`, auth);
  if (!Array.isArray(aiReview.data)) throw new Error('ai review response is not an array');

  console.log('AI Flow OK');
}

module.exports = { run };

if (require.main === module) {
  run()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
