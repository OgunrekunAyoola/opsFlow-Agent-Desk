console.log('STARTING SCRIPT MANUAL TEST SUITE');
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

const API_URL = 'http://localhost:3001';
let serverProcess: ChildProcess | null = null;
let cookie: string = '';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServer() {
  console.log('Starting backend server...');
  const serverPath = path.join(__dirname, '../index.ts');

  // Check if port 3001 is already in use
  try {
    const check = await fetch(API_URL + '/health');
    if (check.ok) {
      console.log('Server is already running on port 3001. Using existing server.');
      return;
    }
  } catch (e) {
    // Server not running, proceed to start
  }

  serverProcess = spawn('npx', ['ts-node', serverPath], {
    cwd: path.join(__dirname, '../../'),
    env: { ...process.env, PORT: '3001', NODE_ENV: 'test' },
    stdio: 'inherit',
    shell: true,
  });

  console.log('Waiting for server to be ready...');
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(API_URL + '/health');
      if (res.ok) {
        console.log('Server is ready!');
        return;
      }
    } catch (e) {
      // ignore
    }
    await sleep(1000);
  }
  throw new Error('Server failed to start within 30 seconds');
}

async function request(method: string, endpoint: string, body?: any) {
  const headers: any = {
    'Content-Type': 'application/json',
    Origin: 'http://localhost:3000',
  };
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  const res = await fetch(API_URL + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Update cookie if present
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    // Simple cookie merging
    const newCookies = setCookie.split(',').map((c) => c.split(';')[0]);
    const existingCookies = cookie ? cookie.split('; ') : [];

    // Create a map of existing cookies
    const cookieMap = new Map();
    existingCookies.forEach((c) => {
      const [key, value] = c.split('=');
      if (key) cookieMap.set(key, value);
    });

    // Update/Add new cookies
    newCookies.forEach((c) => {
      const [key, value] = c.split('=');
      if (key) cookieMap.set(key, value);
    });

    // Reconstruct cookie string
    cookie = Array.from(cookieMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, data };
}

async function runTests() {
  try {
    await startServer();

    console.log('\n--- 1. Auth Tests ---');
    const email = `test-${Date.now()}@example.com`;
    const password = 'Password123!';
    const name = 'Test User';

    console.log(`Registering user: ${email}`);
    let res = await request('POST', '/api/auth/sign-up/email', { email, password, name });

    if (res.status !== 200 && res.status !== 201) {
      console.error('Sign up failed:', res.data);
      // Try login if user exists (though email is unique per run)
      res = await request('POST', '/api/auth/sign-in/email', { email, password });
    }

    if (res.status === 200 || res.status === 201) {
      console.log('Auth success:', res.data.user?.email);
    } else {
      throw new Error(`Auth failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    }

    console.log('\n--- 2. Ticket Tests ---');
    // Create Ticket
    console.log('Creating ticket...');
    res = await request('POST', '/tickets', {
      subject: 'My order is delayed',
      body: 'I ordered a laptop 2 weeks ago and it has not arrived yet. Order #12345.',
      priority: 'medium',
      customerEmail: 'customer@example.com',
    });

    if (res.status !== 201) throw new Error(`Create ticket failed: ${JSON.stringify(res.data)}`);
    const ticketId = res.data._id;
    console.log(`Ticket created: ${ticketId}`);

    // Get Ticket
    console.log('Fetching ticket...');
    res = await request('GET', `/tickets/${ticketId}`);
    if (res.status !== 200) throw new Error(`Get ticket failed: ${JSON.stringify(res.data)}`);
    console.log('Ticket fetched successfully');

    // List Tickets
    console.log('Listing tickets...');
    res = await request('GET', '/tickets');
    if (res.status !== 200) throw new Error(`List tickets failed: ${JSON.stringify(res.data)}`);
    console.log('List Tickets Response:', JSON.stringify(res.data, null, 2));
    console.log(`Found ${res.data.items?.length || 0} tickets`);

    // Run Triage Workflow (Orchestrator)
    console.log('Running Triage Workflow...');
    res = await request('POST', `/tickets/${ticketId}/workflows/triage`);
    if (res.status !== 200) throw new Error(`Triage workflow failed: ${JSON.stringify(res.data)}`);
    console.log('Triage workflow initiated/completed:', res.data);

    // Poll for updates (wait for agent processing)
    console.log('Waiting for AI processing (5s)...');
    await sleep(5000);

    res = await request('GET', `/tickets/${ticketId}`);
    const ticket = res.data;
    console.log('Updated Ticket Status:', ticket.status);
    console.log('AI Classification:', ticket.aiAnalysis);
    console.log('AI Draft:', ticket.aiDraft ? 'Present' : 'Missing');

    if (ticket.status === 'triaged' || ticket.status === 'auto_resolved') {
      console.log('SUCCESS: Ticket was triaged by agents.');
    } else {
      console.warn('WARNING: Ticket status did not change to triaged. Check logs.');
    }

    console.log('\n--- 3. Dashboard Tests ---');
    res = await request('GET', '/dashboard/stats');
    if (res.status !== 200) console.error('Dashboard stats failed:', res.data);
    else console.log('Dashboard stats:', res.data);

    console.log('\n--- 4. User Tests ---');
    // Removed /users/me as it doesn't exist

    res = await request('GET', '/users');
    if (res.status !== 200) console.error('List Users failed:', res.data);
    else console.log(`Found ${res.data.users?.length || 0} users`);

    console.log('\n--- 5. Settings Tests ---');
    res = await request('GET', '/settings/email-config');
    if (res.status !== 200) console.error('Get Settings failed:', res.data);
    else console.log('Settings fetched successfully');

    console.log('\n--- 6. Notification Tests ---');
    res = await request('GET', '/notifications');
    if (res.status !== 200) console.error('Get Notifications failed:', res.data);
    else console.log(`Found ${res.data.items?.length || 0} notifications`);

    console.log('\n--- All Tests Completed ---');
  } catch (error) {
    console.error('Test Suite Failed:', error);
    process.exit(1);
  } finally {
    if (serverProcess) {
      console.log('Stopping server...');
      serverProcess.kill();
    }
    process.exit(0);
  }
}

runTests();
