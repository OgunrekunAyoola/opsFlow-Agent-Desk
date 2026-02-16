const API_URL = 'http://127.0.0.1:3000';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function run() {
  console.log('Auto-Reply Execution Test');
  const ts = Date.now();
  const adminEmail = `auto-reply-admin-${ts}@test.com`;
  const adminPassword = 'Password123!';

  const signup = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'AutoReply Corp',
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });

  const token = signup.data.access_token;
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  await axios.patch(
    `${API_URL}/auth/auto-reply-settings`,
    {
      enabled: true,
      confidenceThreshold: 0.7,
      safeCategories: ['general'],
    },
    auth,
  );

  const t = await axios.post(
    `${API_URL}/tickets`,
    {
      subject: 'Simple product question',
      body: 'Just a quick question about how to use your product.',
      priority: 'medium',
      customerEmail: 'customer@example.com',
      customerName: 'Auto Reply Customer',
      channel: 'email',
      status: 'new',
      category: 'general',
    },
    auth,
  );

  const ticketId = t.data._id;
  if (!ticketId) throw new Error('ticket create failed');

  const wf = await axios.post(
    `${API_URL}/tickets/${ticketId}/workflows/triage`,
    {},
    auth,
  );

  if (wf.data.run?.status !== 'succeeded') {
    throw new Error('workflow failed');
  }

  if (wf.data.ticket?.status !== 'auto_resolved') {
    throw new Error(`expected ticket to be auto_resolved, got ${wf.data.ticket?.status}`);
  }

  if (!wf.data.aiReply) {
    throw new Error('aiReply missing from workflow result');
  }

  if (wf.data.aiReply.deliveryStatus !== 'queued') {
    throw new Error(
      `expected aiReply.deliveryStatus to be queued, got ${wf.data.aiReply.deliveryStatus}`,
    );
  }

  console.log('Auto-Reply Execution OK');
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

