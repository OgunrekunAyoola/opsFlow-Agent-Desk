import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../src/db';
import User from '../src/models/User';
import Tenant from '../src/models/Tenant';
import Ticket from '../src/models/Ticket';
import TicketReply from '../src/models/TicketReply';
import EventLog from '../src/models/EventLog';
import KBArticleProposal from '../src/models/KBArticleProposal';
import crypto from 'crypto';

// Polyfill fetch for older node versions if needed (Node 18+ has it)
// @ts-ignore
const fetch = global.fetch;

const API_URL = 'http://localhost:3001';

async function main() {
  console.log('Connecting to DB...');
  await connectDB();

  // 1. Setup Test Tenant & User
  const email = `test-admin-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test Admin';
  const tenantName = `Test Tenant ${Date.now()}`;

  console.log(`Creating test user: ${email}`);

  // Register via API to get token properly (or just create in DB and sign token, but API is better integration test)
  // Actually, let's just create in DB and mock the auth token if we can,
  // but hitting the API is a true E2E test.

  // Let's create directly in DB to avoid auth complexity in script,
  // but we need a valid token for API calls.
  // Easier to use the /auth/register endpoint.

  let token = '';
  let tenantId = '';
  let userId = '';
  let ingestApiKey = '';

  try {
    // 1. Register with better-auth
    console.log('Registering with better-auth...');
    const regRes = await fetch(`${API_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: API_URL,
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!regRes.ok) {
      throw new Error(`Registration failed: ${await regRes.text()}`);
    }

    // Get cookies
    const cookies = regRes.headers.get('set-cookie');
    if (!cookies) throw new Error('No cookies received after registration');

    const cookieHeader = cookies
      .split(',')
      .map((c) => c.split(';')[0])
      .join('; ');
    console.log('Got session cookie');

    // 2. Trigger Tenant/User creation via /auth/me (lazy creation)
    console.log('Triggering lazy Tenant creation...');
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: cookieHeader, Origin: API_URL },
    });

    if (!meRes.ok) throw new Error(`Auth/Me failed: ${await meRes.text()}`);

    const meData = await meRes.json();
    tenantId = meData.tenant.id;
    userId = meData.user.id;
    console.log(`Registered & Setup. TenantID: ${tenantId}`);

    // Get Ingest API Key
    const settingsRes = await fetch(`${API_URL}/settings/ingest-api-key`, {
      headers: { Cookie: cookieHeader, Origin: API_URL },
    });

    if (!settingsRes.ok) {
      console.error('Settings API Error:', settingsRes.status, await settingsRes.text());
    } else {
      const settingsData = await settingsRes.json();
      ingestApiKey = settingsData.apiKey;
      console.log(`Ingest API Key: ${ingestApiKey}`);
    }

    // 2. Test Level 3: Event Ingestion
    console.log('\n--- Testing Level 3: Event Ingestion ---');
    try {
      const eventPayload = {
        source: 'stripe',
        eventType: 'payment_failed', // Fixed from event to eventType
        severity: 'critical',
        payload: { amount: 500, currency: 'usd', customer: 'cus_123' },
        timestamp: new Date().toISOString(),
      };

      console.log('Sending event with key:', ingestApiKey);

      const ingestRes = await fetch(`${API_URL}/events/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-opsflow-key': ingestApiKey || '',
          Origin: API_URL,
        },
        body: JSON.stringify(eventPayload),
      });

      if (!ingestRes.ok)
        throw new Error(`Event ingestion failed: ${ingestRes.status} ${await ingestRes.text()}`);
      const ingestData = await ingestRes.json();
      console.log('Event Ingested:', ingestData);

      // Verify in DB
      const eventLog = await EventLog.findOne({ tenantId, source: 'stripe' }).sort({
        createdAt: -1,
      });
      if (!eventLog) throw new Error('EventLog not found in DB');
      console.log('✅ EventLog verified in DB');

      // Check if ticket was created (Level 3 proactive)
      if (ingestData.ticketId) {
        console.log(`✅ Proactive Ticket created: ${ingestData.ticketId}`);
      } else {
        console.log('⚠️ No proactive ticket created (might be expected depending on logic)');
      }
    } catch (e) {
      console.error('Level 3 Test Failed', e);
    }

    // 3. Test Level 2: Action Execution
    console.log('\n--- Testing Level 2: Action Execution ---');
    let actionTicketId = '';
    try {
      const ticketRes = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/json',
          Origin: API_URL,
        },
        body: JSON.stringify({
          subject: 'Please refund order #ORD-999',
          body: 'I want a refund for order #ORD-999 because it was damaged.',
          customerEmail: 'customer@example.com',
          priority: 'high',
        }),
      });

      const ticketData = await ticketRes.json();
      actionTicketId = ticketData._id;
      console.log(`Ticket created: ${actionTicketId}`);

      // Trigger Workflow manually
      console.log('Triggering Triage Workflow...');
      const workflowRes = await fetch(`${API_URL}/tickets/${actionTicketId}/workflows/triage`, {
        method: 'POST',
        headers: { Cookie: cookieHeader, Origin: API_URL },
      });

      if (!workflowRes.ok) throw new Error(`Workflow trigger failed: ${await workflowRes.text()}`);
      console.log('Workflow started');

      // Wait for async processing (simple sleep)
      console.log('Waiting for LLM/Action execution...');
      await new Promise((r) => setTimeout(r, 5000));

      // Check for internal note
      const replies = await TicketReply.find({ ticketId: actionTicketId });
      const actionReply = replies.find(
        (r) => r.isInternalNote && r.body.includes('[Automated Action]'),
      );

      if (actionReply) {
        console.log('✅ Action Execution verified:', actionReply.body);
      } else {
        console.log(
          '⚠️ No action execution note found. (Check console for LLM errors or mock fallback)',
        );
      }
    } catch (e) {
      console.error('Level 2 Test Failed', e);
    }

    // 4. Test Level 4: Self-Learning (KB Proposal)
    console.log('\n--- Testing Level 4: Self-Learning ---');
    try {
      // Create 3 similar tickets
      const subjects = [
        'How do I reset my password?',
        'Forgot password, need reset',
        'Password reset link not working',
      ];

      const ticketIds = [];

      for (const sub of subjects) {
        const tRes = await fetch(`${API_URL}/tickets`, {
          method: 'POST',
          headers: {
            Cookie: cookieHeader,
            'Content-Type': 'application/json',
            Origin: API_URL,
          },
          body: JSON.stringify({
            subject: sub,
            body: 'I cannot login, please help me reset my password.',
            customerEmail: 'user@test.com',
          }),
        });
        const tData = await tRes.json();
        ticketIds.push(tData._id);

        // Resolve it
        await fetch(`${API_URL}/tickets/${tData._id}`, {
          method: 'PATCH',
          headers: {
            Cookie: cookieHeader,
            'Content-Type': 'application/json',
            Origin: API_URL,
          },
          body: JSON.stringify({ status: 'closed' }),
        });

        // Add a reply to simulate resolution
        await fetch(`${API_URL}/tickets/${tData._id}/reply`, {
          method: 'POST',
          headers: {
            Cookie: cookieHeader,
            'Content-Type': 'application/json',
            Origin: API_URL,
          },
          body: JSON.stringify({ body: 'Go to settings > security > reset password.' }),
        });

        console.log(`Created and resolved ticket: ${tData._id}`);
      }

      console.log('Waiting for Embedding and KB Proposal generation (may take time)...');
      await new Promise((r) => setTimeout(r, 8000)); // Give queue time to process

      // Check KB Proposal
      const proposals = await KBArticleProposal.find({ tenantId });
      if (proposals.length > 0) {
        console.log(`✅ KB Proposals found: ${proposals.length}`);
        console.log('Proposal Title:', proposals[0].title);
      } else {
        console.log(
          '⚠️ No KB Proposals found. (Requires real LLM or mock queue triggering correctly)',
        );
      }
    } catch (e) {
      console.error('Level 4 Test Failed', e);
    }
  } catch (e) {
    console.error('Setup failed', e);
    process.exit(1);
  }

  console.log('\nVerification Complete.');
  process.exit(0);
}

main();
