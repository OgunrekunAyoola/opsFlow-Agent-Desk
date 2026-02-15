const API_URL = 'http://127.0.0.1:3000';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function run() {
  const ts = Date.now();
  const adminEmail = `admin-${ts}@test.com`;
  const adminPassword = 'Password123!';
  let adminToken = '';
  let inboundAddress = '';
  let ticketId = '';
  console.log('Endpoints Test');

  // Signup
  const signup = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'Endpoints Corp',
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });
  adminToken = signup.data.access_token;
  inboundAddress = signup.data.inbound?.address;
  const auth = { headers: { Authorization: `Bearer ${adminToken}` } };

  // Forgot password (email flow)
  const forgot = await axios.post(`${API_URL}/auth/forgot-password`, { email: adminEmail });
  if (!forgot.data.message) throw new Error('forgot-password failed');

  // Auth/me
  const me = await axios.get(`${API_URL}/auth/me`, auth);
  if (!me.data.user?.email) throw new Error('me failed');

  // Dashboard
  const stats0 = await axios.get(`${API_URL}/dashboard/stats`, auth);
  if (stats0.data.totalTickets !== 0) throw new Error('expected 0 tickets');

  // Create Client
  const client = await axios.post(
    `${API_URL}/clients`,
    { name: 'Acme Inc', domain: 'acme.com' },
    auth,
  );
  if (!client.data.client?.id) throw new Error('client create failed');

  // Create Ticket
  const t1 = await axios.post(
    `${API_URL}/tickets`,
    {
      subject: 'Endpoint Test',
      body: 'Body',
      priority: 'medium',
      customerEmail: 'customer@acme.com',
      customerName: 'Cust',
      channel: 'email',
      status: 'new',
      category: 'general',
    },
    auth,
  );
  ticketId = t1.data._id;

  // List Tickets
  const list = await axios.get(`${API_URL}/tickets?page=1&pageSize=5`, auth);
  if (!Array.isArray(list.data.items)) throw new Error('list tickets failed');

  // Ticket Detail
  const detail = await axios.get(`${API_URL}/tickets/${ticketId}`, auth);
  if (!detail.data._id) throw new Error('ticket detail failed');

  // Update Ticket
  const upd = await axios.patch(
    `${API_URL}/tickets/${ticketId}`,
    { status: 'triaged', priority: 'high' },
    auth,
  );
  if (upd.data.status !== 'triaged') throw new Error('update status failed');

  // Run Workflow
  const wf = await axios.post(`${API_URL}/tickets/${ticketId}/workflows/triage`, {}, auth);
  if (wf.data.run?.status !== 'succeeded') throw new Error('workflow failed');

  // Inbound Email webhook (by address)
  const inbound = await axios.post(`${API_URL}/email/inbound`, {
    to: inboundAddress,
    from: 'sender@acme.com',
    subject: 'Inbound',
    text: 'Hello',
    messageId: `msg-${ts}`,
  });
  if (!inbound.data.ticket?._id) throw new Error('inbound failed');

  // Delivery events (expect 404 without secret/id)
  try {
    await axios.post(`${API_URL}/email/events`, { type: 'email.sent' });
  } catch (e) {
    if (e.response?.status !== 404 && e.response?.status !== 400)
      throw new Error('events route expected failure');
  }

  console.log('Endpoints OK');
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
