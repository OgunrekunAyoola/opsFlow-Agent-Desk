const API_URL = process.env.API_URL || 'http://127.0.0.1:3001';
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

  const signup = await axios.post(`${API_URL}/api/auth/sign-up/email`, {
    email: adminEmail,
    password: adminPassword,
    name: 'Admin',
  });
  if (!signup.data.user?.email) throw new Error('signup missing user');

  const setCookie = signup.headers['set-cookie'] || [];
  const cookieHeader = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(';')[0]).join('; ')
    : '';
  if (!cookieHeader) throw new Error('missing session cookies after sign-up');

  const me = await axios.get(`${API_URL}/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  if (!me.data.user?.email) throw new Error('me failed after signup');

  console.log('Login Flow OK');
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
