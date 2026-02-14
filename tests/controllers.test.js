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
  const memberEmail = `member-${ts}@test.com`;
  let adminToken = '';
  let memberToken = '';
  console.log('Controllers Test');

  // Signup admin
  const signup = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'Controllers Corp',
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });
  adminToken = signup.data.access_token;
  const authAdmin = { headers: { Authorization: `Bearer ${adminToken}` } };

  // Create member via /users (admin-only)
  await axios.post(
    `${API_URL}/users`,
    { name: 'Member', email: memberEmail, password: 'Password123!', role: 'member' },
    authAdmin,
  );

  // Login as member
  const loginMember = await axios.post(`${API_URL}/auth/login`, {
    email: memberEmail,
    password: 'Password123!',
  });
  memberToken = loginMember.data.access_token;
  const authMember = { headers: { Authorization: `Bearer ${memberToken}` } };

  // Users list should be forbidden for member
  let forbiddenOk = false;
  try {
    await axios.get(`${API_URL}/users`, authMember);
  } catch (e) {
    forbiddenOk = e.response?.status === 403;
  }
  if (!forbiddenOk) throw new Error('member should be forbidden on /users');

  // Users list works for admin
  const users = await axios.get(`${API_URL}/users`, authAdmin);
  if (!Array.isArray(users.data.users) || users.data.users.length < 2)
    throw new Error('admin users list unexpected');

  // Clients create/list admin-only
  const clientRes = await axios.post(
    `${API_URL}/clients`,
    { name: 'CtrlClient', domain: 'ctrl.test' },
    authAdmin,
  );
  if (!clientRes.data.client?.id) throw new Error('client create failed');
  const clients = await axios.get(`${API_URL}/clients`, authAdmin);
  if (clients.data.clients.length < 1) throw new Error('clients list failed');

  // Dashboard stats available to both roles
  const statsAdmin = await axios.get(`${API_URL}/dashboard/stats`, authAdmin);
  const statsMember = await axios.get(`${API_URL}/dashboard/stats`, authMember);
  if (typeof statsAdmin.data.totalTickets !== 'number') throw new Error('stats failed');
  if (typeof statsMember.data.totalTickets !== 'number') throw new Error('stats failed');

  console.log('Controllers OK');
}

module.exports = { run };
