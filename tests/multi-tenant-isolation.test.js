const API_URL = 'http://127.0.0.1:3000';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function run() {
  console.log('Multi-Tenant Isolation Test');
  const ts = Date.now();

  const adminAEmail = `tenantA-${ts}@test.com`;
  const adminBEmail = `tenantB-${ts}@test.com`;
  const adminPassword = 'Password123!';

  const signupA = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'Tenant A',
    name: 'Admin A',
    email: adminAEmail,
    password: adminPassword,
  });
  const tokenA = signupA.data.access_token;
  if (!tokenA) throw new Error('Tenant A signup missing access_token');

  const signupB = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'Tenant B',
    name: 'Admin B',
    email: adminBEmail,
    password: adminPassword,
  });
  const tokenB = signupB.data.access_token;
  if (!tokenB) throw new Error('Tenant B signup missing access_token');

  const authA = { headers: { Authorization: `Bearer ${tokenA}` } };
  const authB = { headers: { Authorization: `Bearer ${tokenB}` } };

  const ticketASubject = `Tenant A Ticket ${ts}`;
  const ticketBSubject = `Tenant B Ticket ${ts}`;

  const ticketARes = await axios.post(
    `${API_URL}/tickets`,
    {
      subject: ticketASubject,
      body: 'Body for tenant A ticket',
      priority: 'medium',
      category: 'general',
      customerEmail: 'a@example.com',
    },
    authA,
  );
  const ticketAId = ticketARes.data._id;
  if (!ticketAId) throw new Error('Tenant A ticket create failed');

  const ticketBRes = await axios.post(
    `${API_URL}/tickets`,
    {
      subject: ticketBSubject,
      body: 'Body for tenant B ticket',
      priority: 'medium',
      category: 'general',
      customerEmail: 'b@example.com',
    },
    authB,
  );
  const ticketBId = ticketBRes.data._id;
  if (!ticketBId) throw new Error('Tenant B ticket create failed');

  const listA = await axios.get(`${API_URL}/tickets`, authA);
  const itemsA = listA.data?.items || [];

  if (itemsA.some((t) => t._id === ticketBId || t.subject === ticketBSubject)) {
    throw new Error('Tenant A can see Tenant B ticket in list');
  }

  let wrongAccess = false;
  try {
    await axios.get(`${API_URL}/tickets/${ticketBId}`, authA);
    wrongAccess = true;
  } catch (err) {
    const status = err.response?.status;
    if (status !== 404) {
      throw err;
    }
  }
  if (wrongAccess) {
    throw new Error('Tenant A could fetch Tenant B ticket by id');
  }

  console.log('Multi-Tenant Isolation OK');
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

