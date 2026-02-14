const API_URL = 'http://127.0.0.1:3000';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const ts = Date.now();
  const adminEmail = `admin-${ts}@test.com`;
  const adminPassword = 'Password123!';
  let token = '';
  let ticketId = '';
  console.log('Queue Verify');

  // Signup
  const signup = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'Queue Corp',
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });
  token = signup.data.access_token;
  const headers = { Authorization: `Bearer ${token}` };

  // Create ticket
  const t = await axios.post(
    `${API_URL}/tickets`,
    {
      subject: 'Queue Test',
      body: 'Check background sending',
      priority: 'medium',
      customerEmail: 'customer@example.com',
      customerName: 'Customer',
      channel: 'email',
      status: 'new',
      category: 'general',
    },
    { headers },
  );
  ticketId = t.data._id;

  // Reply (enqueue)
  const r = await axios.post(
    `${API_URL}/tickets/${ticketId}/reply`,
    { body: 'Hello from background worker.' },
    { headers },
  );
  const replyId = r.data._id;
  if (!replyId || r.data.deliveryStatus !== 'queued') throw new Error('reply enqueue failed');

  // Poll ticket detail for status change
  let status = 'queued';
  for (let i = 0; i < 10; i++) {
    await sleep(500);
    const detail = await axios.get(`${API_URL}/tickets/${ticketId}`, { headers });
    const reply = (detail.data.replies || []).find((x) => x._id === replyId);
    status = reply?.deliveryStatus || status;
    if (status !== 'queued') break;
  }
  if (status !== 'sent') throw new Error(`expected sent, got ${status}`);
  console.log('Queue Verify OK');
}

module.exports = { run };
