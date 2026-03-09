const API_URL = 'http://127.0.0.1:3001';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function signupAdmin() {
  const ts = Date.now();
  const email = `kb-admin-${ts}@test.com`;
  const password = 'Password123!';
  const signup = await axios.post(`${API_URL}/api/auth/sign-up/email`, {
    email,
    password,
    name: 'KB Admin',
  });
  const setCookie = signup.headers['set-cookie'] || [];
  const cookieHeader = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(';')[0]).join('; ')
    : '';
  if (!cookieHeader) throw new Error('signup did not return cookies');
  return { headers: { Cookie: cookieHeader } };
}

async function run() {
  console.log('KB Test');
  const auth = await signupAdmin();

  const createResp = await axios.post(
    `${API_URL}/kb`,
    {
      title: 'Login troubleshooting guide',
      body: 'If agents cannot log in, check credentials and reset passwords as needed.',
      tags: ['auth', 'login', 'troubleshooting'],
    },
    auth,
  );
  const created = createResp.data.article;
  if (!created || !created._id) throw new Error('kb create failed');
  const articleId = created._id;

  const listResp = await axios.get(`${API_URL}/kb`, auth);
  if (!Array.isArray(listResp.data.items) || listResp.data.items.length < 1)
    throw new Error('kb list empty');

  const searchResp = await axios.get(`${API_URL}/kb`, {
    ...auth,
    params: { q: 'login' },
  });
  if (!Array.isArray(searchResp.data.items) || searchResp.data.items.length < 1)
    throw new Error('kb search returned no items');

  const getResp = await axios.get(`${API_URL}/kb/${articleId}`, auth);
  if (!getResp.data.article || getResp.data.article._id !== articleId)
    throw new Error('kb get by id failed');

  const patchResp = await axios.patch(
    `${API_URL}/kb/${articleId}`,
    {
      title: 'Updated login troubleshooting guide',
      tags: ['auth', 'login'],
    },
    auth,
  );
  if (
    !patchResp.data.article ||
    patchResp.data.article.title !== 'Updated login troubleshooting guide'
  )
    throw new Error('kb patch failed');

  const deleteResp = await axios.delete(`${API_URL}/kb/${articleId}`, auth);
  if (!deleteResp.data.ok) throw new Error('kb delete failed');

  let notFound = false;
  try {
    await axios.get(`${API_URL}/kb/${articleId}`, auth);
  } catch (e) {
    if (e.response && e.response.status === 404) {
      notFound = true;
    } else {
      throw e;
    }
  }
  if (!notFound) throw new Error('kb deleted article did not 404');

  const ragResp = await axios.post(
    `${API_URL}/kb`,
    {
      title: 'AI triage login issues',
      body: 'When tickets mention agents unable to log in, suggest the login troubleshooting guide.',
      tags: ['ai_triage', 'login'],
    },
    auth,
  );
  const ragArticle = ragResp.data.article;
  if (!ragArticle || !ragArticle._id) throw new Error('kb rag article create failed');

  const ticketResp = await axios.post(
    `${API_URL}/tickets`,
    {
      subject: 'Agents cannot log in to dashboard',
      body: 'Multiple agents report login failures when accessing the dashboard today.',
      priority: 'high',
      customerEmail: 'kb-test@example.com',
      customerName: 'KB Test Customer',
      channel: 'email',
      status: 'new',
      category: 'general',
    },
    auth,
  );
  const ticketId = ticketResp.data._id;
  if (!ticketId) throw new Error('ticket create failed for kb rag test');

  const wfResp = await axios.post(`${API_URL}/tickets/${ticketId}/workflows/triage`, {}, auth);
  if (!wfResp.data.run || wfResp.data.run.status !== 'succeeded')
    throw new Error('kb rag workflow failed');

  const ticket = wfResp.data.ticket;
  if (!ticket || !ticket.aiAnalysis) throw new Error('kb rag aiAnalysis missing');

  const sources = Array.isArray(ticket.aiAnalysis.sources) ? ticket.aiAnalysis.sources : [];
  const matchedSource = sources.find(
    (s) => s.id === ragArticle._id || s.title === ragArticle.title,
  );
  if (!matchedSource) throw new Error('kb rag article not included in aiAnalysis.sources');

  console.log('KB Test OK');
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
