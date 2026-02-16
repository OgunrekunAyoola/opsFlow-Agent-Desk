const API_URL = process.env.API_URL || 'http://127.0.0.1:3000';
let axios;
try {
  axios = require('../frontend/node_modules/axios');
} catch {
  axios = require('../backend/node_modules/axios');
}

async function runWithConcurrency(total, concurrency, worker) {
  let index = 0;
  let active = 0;
  let resolved = 0;
  let failed = 0;

  return new Promise((resolve) => {
    function startNext() {
      if (resolved + failed >= total) {
        if (active === 0) resolve({ resolved, failed });
        return;
      }
      while (active < concurrency && index < total) {
        const current = index;
        index += 1;
        active += 1;
        worker(current)
          .then(() => {
            resolved += 1;
          })
          .catch((err) => {
            failed += 1;
            console.error('Worker error', current, err?.response?.status, err?.message);
          })
          .finally(() => {
            active -= 1;
            if ((resolved + failed) % 1000 === 0) {
              console.log(
                `Progress: ${resolved + failed}/${total} (ok=${resolved}, failed=${failed})`,
              );
            }
            startNext();
          });
      }
    }
    startNext();
  });
}

async function createAdmin(ts) {
  const adminEmail = `admin-stress-${ts}@test.com`;
  const adminPassword = 'Password123!';
  console.log('Phase 1: create admin tenant');
  const signup = await axios.post(`${API_URL}/auth/signup`, {
    tenantName: 'Stress Corp',
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
  });
  const token = signup.data.access_token;
  if (!token) throw new Error('signup missing access_token');
  const headers = { Authorization: `Bearer ${token}` };
  return { headers, adminEmail, adminPassword };
}

async function scenarioUsers(ts, headers, totalUsers, concurrency) {
  console.log('Scenario: users (/users create)');
  const t0 = Date.now();
  const userResult = await runWithConcurrency(totalUsers, concurrency, async (i) => {
    const email = `member-stress-${ts}-${i}@test.com`;
    await axios.post(
      `${API_URL}/users`,
      { name: `Member ${i}`, email, password: 'Password123!', role: 'member' },
      { headers },
    );
  });
  const t1 = Date.now();
  console.log(
    `Users scenario done in ${(t1 - t0) / 1000}s (ok=${userResult.resolved}, failed=${userResult.failed})`,
  );
  return userResult;
}

async function scenarioAuth(ts, adminEmail, adminPassword, totalOps, concurrency) {
  console.log('Scenario: auth (login + refresh)');
  const t0 = Date.now();
  const result = await runWithConcurrency(totalOps, concurrency, async () => {
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword,
    });
    const access = login.data.access_token;
    if (!access) throw new Error('login missing access_token');
    const setCookie = login.headers['set-cookie'] || [];
    const cookieHeader = Array.isArray(setCookie) ? setCookie.join('; ') : '';
    if (!cookieHeader.includes('refresh_token')) throw new Error('refresh cookie missing');
    const refresh = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { headers: { Cookie: cookieHeader } },
    );
    const access2 = refresh.data.access_token;
    if (!access2) throw new Error('refresh missing access_token');
  });
  const t1 = Date.now();
  console.log(
    `Auth scenario done in ${(t1 - t0) / 1000}s (ok=${result.resolved}, failed=${result.failed})`,
  );
  return result;
}

async function scenarioTickets(ts, headers, totalOps, concurrency) {
  console.log('Scenario: tickets (create + list)');
  const ticketIds = [];
  const t0 = Date.now();
  const result = await runWithConcurrency(totalOps, concurrency, async (i) => {
    const mod = i % 2;
    if (mod === 0) {
      const res = await axios.post(
        `${API_URL}/tickets`,
        {
          subject: `Stress Ticket ${i}`,
          body: 'Body',
          priority: 'medium',
          customerEmail: `customer-${ts}-${i}@example.com`,
          customerName: 'Cust',
          channel: 'email',
          status: 'new',
          category: 'general',
        },
        { headers },
      );
      if (res.data && res.data._id) ticketIds.push(res.data._id);
    } else {
      await axios.get(`${API_URL}/tickets?page=1&pageSize=20`, { headers });
    }
  });
  const t1 = Date.now();
  console.log(
    `Tickets scenario done in ${(t1 - t0) / 1000}s (ok=${result.resolved}, failed=${result.failed})`,
  );
  return result;
}

async function scenarioAI(ts, headers, totalOps, concurrency) {
  console.log('Scenario: AI (triage workflows)');
  const seedCount = Math.min(totalOps, 100);
  const seedIds = [];
  for (let i = 0; i < seedCount; i += 1) {
    const res = await axios.post(
      `${API_URL}/tickets`,
      {
        subject: `AI Seed Ticket ${i}`,
        body: 'Body',
        priority: 'medium',
        customerEmail: `customer-ai-${ts}-${i}@example.com`,
        customerName: 'Cust',
        channel: 'email',
        status: 'new',
        category: 'general',
      },
      { headers },
    );
    if (res.data && res.data._id) seedIds.push(res.data._id);
  }
  const t0 = Date.now();
  const result = await runWithConcurrency(totalOps, concurrency, async () => {
    const id = seedIds[Math.floor(Math.random() * seedIds.length)];
    await axios.post(`${API_URL}/tickets/${id}/workflows/triage`, {}, { headers });
  });
  const t1 = Date.now();
  console.log(
    `AI scenario done in ${(t1 - t0) / 1000}s (ok=${result.resolved}, failed=${result.failed})`,
  );
  return result;
}

async function scenarioMixed(ts, headers, totalUsers, totalOps, concurrency) {
  console.log('Scenario: mixed (users + dashboard/tickets/triage)');
  const userResult = await scenarioUsers(ts, headers, totalUsers, concurrency);
  const ticketIds = [];
  const t2 = Date.now();
  const opsResult = await runWithConcurrency(totalOps, concurrency, async (i) => {
    const mod = i % 4;
    if (mod === 0) {
      await axios.get(`${API_URL}/dashboard/stats`, { headers });
    } else if (mod === 1) {
      await axios.get(`${API_URL}/tickets?page=1&pageSize=20`, { headers });
    } else if (mod === 2) {
      const res = await axios.post(
        `${API_URL}/tickets`,
        {
          subject: `Stress Ticket ${i}`,
          body: 'Body',
          priority: 'medium',
          customerEmail: `customer-${ts}-${i}@example.com`,
          customerName: 'Cust',
          channel: 'email',
          status: 'new',
          category: 'general',
        },
        { headers },
      );
      if (res.data && res.data._id) ticketIds.push(res.data._id);
    } else {
      if (ticketIds.length === 0) {
        await axios.get(`${API_URL}/dashboard/stats`, { headers });
        return;
      }
      const id = ticketIds[Math.floor(Math.random() * ticketIds.length)];
      await axios.post(`${API_URL}/tickets/${id}/workflows/triage`, {}, { headers });
    }
  });
  const t3 = Date.now();
  console.log(
    `Mixed ops done in ${(t3 - t2) / 1000}s (ok=${opsResult.resolved}, failed=${opsResult.failed})`,
  );
  return { userResult, opsResult };
}

async function main() {
  const ts = Date.now();
  const totalUsers = Math.max(parseInt(process.env.STRESS_USERS || '20000', 10), 1);
  const totalOps = Math.max(parseInt(process.env.STRESS_OPS || '20000', 10), 1);
  const concurrency = Math.max(parseInt(process.env.STRESS_CONCURRENCY || '200', 10), 1);
  const cliScenario = process.argv[2];
  const envScenario = process.env.STRESS_SCENARIO;
  const scenario = (cliScenario || envScenario || 'mixed').toLowerCase();

  console.log('Stress config', {
    API_URL,
    totalUsers,
    totalOps,
    concurrency,
    scenario,
  });

  const { headers, adminEmail, adminPassword } = await createAdmin(ts);

  let result;
  if (scenario === 'auth') {
    result = await scenarioAuth(ts, adminEmail, adminPassword, totalOps, concurrency);
  } else if (scenario === 'users') {
    result = await scenarioUsers(ts, headers, totalUsers, concurrency);
  } else if (scenario === 'tickets') {
    result = await scenarioTickets(ts, headers, totalOps, concurrency);
  } else if (scenario === 'ai') {
    result = await scenarioAI(ts, headers, totalOps, concurrency);
  } else {
    result = await scenarioMixed(ts, headers, totalUsers, totalOps, concurrency);
  }

  console.log('Scenario result', JSON.stringify(result));
  console.log('Stress test complete');
}

if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Stress test failed', err?.response?.status, err?.message || err);
      process.exit(1);
    });
}
