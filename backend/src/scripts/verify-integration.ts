import mongoose from 'mongoose';
import { connectDB } from '../db';
import VectorDoc from '../models/VectorDoc';
import Ticket from '../models/Ticket';
import IntegrationConnection from '../models/IntegrationConnection';
import SyncedObject from '../models/SyncedObject';

const BASE_URL = 'http://127.0.0.1:3001';

async function req(method: string, path: string, body?: any, headers: any = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text), headers: res.headers };
  } catch {
    return { status: res.status, data: text, headers: res.headers };
  }
}

async function main() {
  console.log('Connecting to DB...');
  await connectDB();

  // 1. Create Admin User
  const email = `admin.integration.${Date.now()}@example.com`;
  const password = 'Password123!';
  console.log(`Creating user: ${email}`);

  const signUpRes = await req('POST', '/api/auth/sign-up/email', {
    email,
    password,
    name: 'Integration Tester',
  });

  if (!signUpRes || signUpRes.status !== 200) {
    throw new Error(`Sign up failed: ${JSON.stringify(signUpRes?.data)}`);
  }

  const cookie = signUpRes.headers.get('set-cookie');
  const headers = { Cookie: cookie };

  // 2. List Integrations
  console.log('Listing integrations...');
  const listRes = await req('GET', '/integrations', null, headers);
  if (!listRes || listRes.status !== 200) throw new Error('List failed');

  const dummy = listRes.data.providers.find((p: any) => p.name === 'dummy');
  if (!dummy) throw new Error('Dummy provider not found');
  console.log('Found dummy provider');

  // 3. Connect (Get URL)
  console.log('Starting connection flow...');
  const connectRes = await req('POST', '/integrations/dummy/connect', {}, headers);
  if (!connectRes || connectRes.status !== 200) throw new Error('Connect failed');
  console.log('Connect URL:', connectRes.data.url);

  // 4. Callback
  console.log('Calling callback...');
  const callbackRes = await req(
    'POST',
    '/integrations/dummy/callback',
    { code: 'dummy_code' },
    headers,
  );
  if (!callbackRes || callbackRes.status !== 200)
    throw new Error(`Callback failed: ${JSON.stringify(callbackRes?.data)}`);
  console.log('Callback success, connection created:', callbackRes.data.connection._id);

  const connectionId = callbackRes.data.connection._id;

  // 5. Wait for Initial Sync (triggered by callback)
  console.log('Waiting for initial sync (30s)...');
  await new Promise((r) => setTimeout(r, 30000));

  // 6. Verify Data
  const tenantId = callbackRes.data.connection.tenantId;

  const tickets = await Ticket.find({ tenantId, channel: 'integration' });
  console.log(`Found ${tickets.length} integration tickets (Expected >= 2)`);
  if (tickets.length < 2) throw new Error('Tickets not synced');

  const syncedObjs = await SyncedObject.find({ tenantId, integrationConnectionId: connectionId });
  console.log(`Found ${syncedObjs.length} synced objects (Expected >= 4: 2 tickets + 2 docs)`);
  if (syncedObjs.length < 4) {
    const types = syncedObjs
      .map((s) => s.type)
      .reduce(
        (acc, t) => {
          acc[t] = (acc[t] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
    throw new Error(`Synced objects missing. Found: ${JSON.stringify(types)}`);
  }

  const vectorDocs = await VectorDoc.find({ tenantId });
  console.log(`Found ${vectorDocs.length} vector docs (Expected >= 4)`);
  if (vectorDocs.length < 4) throw new Error('Vector docs missing');

  console.log('Verification PASSED!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
