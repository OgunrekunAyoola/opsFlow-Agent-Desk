const API_URL = 'http://127.0.0.1:3000';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function run() {
  console.log('Login Flow Test');
  const ts = Date.now();
  const adminEmail = `admin-${ts}@test.com`;
  const adminPassword = 'Password123!';

  // Signup
  const signup = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'LoginFlow Corp',
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });
  const access1 = signup.data.access_token;
  if (!access1) throw new Error('signup missing access_token');

  // me with access token
  const me1 = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${access1}` },
  });
  if (!me1.data.user?.email) throw new Error('me failed after signup');

  // login to get refresh cookie
  const login = await axios.post(`${API_URL}/auth/login`, {
    email: adminEmail,
    password: adminPassword,
  });
  const access2 = login.data.access_token;
  if (!access2) throw new Error('login missing access_token');
  const setCookie = login.headers['set-cookie'] || [];
  const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : '';
  if (!cookieHeader.includes('refresh_token')) throw new Error('refresh cookie missing');

  // refresh using cookie
  const refresh = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    { headers: { Cookie: cookieHeader } },
  );
  const access3 = refresh.data.access_token;
  if (!access3) throw new Error('refresh missing access_token');

  // logout to clear cookie
  await axios.post(`${API_URL}/auth/logout`, {}, { headers: { Cookie: cookieHeader } });

  let refreshFailed = false;
  try {
    await axios.post(`${API_URL}/auth/refresh`, {}, { headers: { Cookie: cookieHeader } });
  } catch (e) {
    refreshFailed = e.response?.status === 401;
  }
  if (!refreshFailed) throw new Error('refresh should fail after logout');

  console.log('Login Flow OK');
}

module.exports = { run };
