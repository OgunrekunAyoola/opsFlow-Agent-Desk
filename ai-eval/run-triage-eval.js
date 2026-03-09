/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

let axios;
try {
  // Prefer frontend axios so versions stay in sync with UI
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

const API_URL = process.env.API_URL || 'http://127.0.0.1:3000';
const EVAL_PATH = path.join(__dirname, 'triage_eval.json');

async function signupAdmin() {
  const ts = Date.now();
  const adminEmail = `triage-admin-${ts}@test.com`;
  const adminPassword = 'Password123!';

  const signup = await axios.post(`${API_URL}/api/auth/sign-up/email`, {
    email: adminEmail,
    password: adminPassword,
    name: 'Eval Admin',
  });

  const setCookie = signup.headers['set-cookie'] || [];
  const cookieHeader = Array.isArray(setCookie)
    ? setCookie.map((c) => c.split(';')[0]).join('; ')
    : '';
  if (!cookieHeader) {
    throw new Error('signup did not return cookies');
  }
  return { cookieHeader, adminEmail };
}

async function runSingleCase(http, authHeaders, testCase) {
  const { subject, body, expectedCategory, expectedPriority } = testCase;

  const create = await http.post(
    '/tickets',
    {
      subject,
      body,
      priority: 'medium',
      customerEmail: 'eval-customer@example.com',
      customerName: 'Eval Customer',
      channel: 'email',
      status: 'new',
      category: 'general',
    },
    { headers: authHeaders },
  );

  const ticketId = create.data._id;
  if (!ticketId) {
    throw new Error('ticket create failed');
  }

  const wf = await http.post(`/tickets/${ticketId}/workflows/triage`, {}, { headers: authHeaders });
  if (!wf.data.run || wf.data.run.status !== 'succeeded') {
    throw new Error('workflow did not succeed');
  }

  const ticket = wf.data.ticket;
  if (!ticket || !ticket.aiAnalysis) {
    throw new Error('aiAnalysis missing on ticket');
  }

  const { category, priority } = ticket;

  const categoryCorrect = category === expectedCategory;
  const priorityCorrect = priority === expectedPriority;

  return {
    id: testCase.id,
    categoryExpected: expectedCategory,
    categoryActual: category,
    categoryCorrect,
    priorityExpected: expectedPriority,
    priorityActual: priority,
    priorityCorrect,
  };
}

async function main() {
  console.log('🔍 Running ticket triage evaluation...\n');

  if (!fs.existsSync(EVAL_PATH)) {
    console.error(`Eval file not found at ${EVAL_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(EVAL_PATH, 'utf8');
  const cases = JSON.parse(raw);
  if (!Array.isArray(cases) || cases.length === 0) {
    console.error('Eval file is empty or invalid');
    process.exit(1);
  }

  const { cookieHeader, adminEmail } = await signupAdmin();
  console.log(`Using fresh eval tenant for ${adminEmail}`);

  const http = axios.create({
    baseURL: API_URL,
  });
  const authHeaders = { Cookie: cookieHeader };

  const results = [];
  let categoryCorrectCount = 0;
  let priorityCorrectCount = 0;

  // Run sequentially for clarity and easier debugging
  for (const testCase of cases) {
    try {
      const res = await runSingleCase(http, authHeaders, testCase);
      results.push(res);
      if (res.categoryCorrect) categoryCorrectCount += 1;
      if (res.priorityCorrect) priorityCorrectCount += 1;
      console.log(
        `Case ${res.id}: category ${res.categoryActual} (expected ${res.categoryExpected})` +
          `, priority ${res.priorityActual} (expected ${res.priorityExpected})`,
      );
    } catch (err) {
      console.error(`Case ${testCase.id} FAILED:`, err.response?.data || err.message);
    }
  }

  const total = results.length;
  const categoryAccuracy = total > 0 ? categoryCorrectCount / total : 0;
  const priorityAccuracy = total > 0 ? priorityCorrectCount / total : 0;

  console.log('\n📊 Triage Evaluation Summary');
  console.log(`Total cases: ${total}`);
  console.log(
    `Category accuracy: ${(categoryAccuracy * 100).toFixed(1)}% (${categoryCorrectCount}/${total})`,
  );
  console.log(
    `Priority accuracy: ${(priorityAccuracy * 100).toFixed(1)}% (${priorityCorrectCount}/${total})`,
  );
}

main().catch((err) => {
  console.error('Triage eval failed:', err.response?.data || err.message);
  process.exit(1);
});

