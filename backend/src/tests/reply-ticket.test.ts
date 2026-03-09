import mongoose from 'mongoose';
import dotenv from 'dotenv';
import assert from 'assert';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';
import User from '../models/User';
import Tenant from '../models/Tenant';
import { replyTicket } from '../grpc/server';
import { emailSendQueue } from '../queue/index';
import { RAGService } from '../services/RAGService';

dotenv.config();

// Helper to wait
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log('\n--- Running ReplyTicket RPC Integration Tests ---');

  // 1. Setup DB Connection
  // Assuming we use the same connection string logic as triage-workflow.test.ts or a real test DB
  // For simplicity, let's try to connect to the TEST_DB_URI or fallback
  const mongoUri =
    process.env.MONGO_URI || process.env.TEST_DB_URI || 'mongodb://127.0.0.1:27017/opsflow_test';
  if (!mongoUri) {
    console.error('❌ No MONGO_URI, MONGODB_URI or TEST_DB_URI found.');
    process.exit(1);
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to Test DB');
    }
  } catch (err) {
    console.error('❌ DB Connection Failed:', err);
    process.exit(1);
  }

  // 2. Mocks
  // Mock emailSendQueue
  const originalQueueAdd = emailSendQueue.add;
  let emailQueueCalls: any[] = [];
  (emailSendQueue as any).add = async (name: string, data: any) => {
    console.log(`[MockQueue] Added job: ${name}`, data);
    emailQueueCalls.push({ name, data });
    return { id: 'mock-job-id' };
  };

  // Mock RAGService
  const originalUpsertDoc = RAGService.prototype.upsertDoc;
  let ragUpsertCalls: any[] = [];
  RAGService.prototype.upsertDoc = async (tenantId, type, docId, content, metadata) => {
    console.log(`[MockRAG] Upserted doc: ${docId}`);
    ragUpsertCalls.push({ tenantId, type, docId, content, metadata });
    return;
  };

  let tenantId: string | undefined;
  let userId: string | undefined;
  let ticketId: string | undefined;

  try {
    // 3. Create Test Data
    const tenant = await Tenant.create({ name: 'Reply Test Tenant', domain: 'reply-test.com' });
    tenantId = tenant._id.toString();

    const user = await User.create({
      tenantId: tenant._id,
      email: 'agent-reply@test.com',
      name: 'Agent Reply',
      role: 'member',
      passwordHash: 'hash',
    });
    userId = user._id.toString();

    const ticket = await Ticket.create({
      tenantId: tenant._id,
      subject: 'Question needing reply',
      body: 'Please help me.',
      status: 'new',
      priority: 'medium',
      customerEmail: 'customer@example.com',
      source: 'email',
      channel: 'email',
    });
    ticketId = ticket._id.toString();
    console.log(`Created Ticket: ${ticketId}`);

    // 4. Test Execution: Call replyTicket
    console.log('Testing replyTicket RPC...');

    const mockCall = {
      request: {
        id: ticketId,
        tenantId: tenantId,
        body: 'Here is the solution to your problem.',
        userId: userId,
      },
      metadata: {
        getMap: () => ({ 'x-request-id': 'test-req-123' }),
      },
    };

    const mockCallback = (error: any, response: any) => {
      if (error) {
        throw new Error(`RPC Callback Error: ${JSON.stringify(error)}`);
      }
      return response;
    };

    // Wrap callback in a promise to await it (though the function is async, the callback is the result)
    // Actually replyTicket is async, but it calls callback.
    // We can just await replyTicket(mockCall, mockCallbackSpy)

    let callbackResponse: any = null;
    let callbackError: any = null;
    const callbackSpy = (err: any, res: any) => {
      callbackError = err;
      callbackResponse = res;
    };

    await replyTicket(mockCall, callbackSpy);

    // 5. Assertions
    console.log('Verifying results...');

    // A. Check Callback
    assert.strictEqual(callbackError, null, 'Callback should not return error');
    assert(callbackResponse, 'Callback should return response');
    assert.strictEqual(callbackResponse.status, 'replied', 'Response status should be replied');

    // B. Check Ticket Status in DB
    const updatedTicket = await Ticket.findById(ticketId);
    assert.strictEqual(
      updatedTicket?.status,
      'replied',
      'Ticket status should be updated to replied',
    );

    // C. Check TicketReply creation
    const reply = await TicketReply.findOne({ ticketId: ticketId });
    assert(reply, 'TicketReply should be created');
    assert.strictEqual(reply?.body, 'Here is the solution to your problem.', 'Reply body matches');
    assert.strictEqual(reply?.authorType, 'human', 'Author type is human');
    assert.strictEqual(reply?.authorId?.toString(), userId, 'Author ID matches');

    // D. Check Email Queue
    assert.strictEqual(emailQueueCalls.length, 1, 'Should add 1 job to email queue');
    assert.strictEqual(emailQueueCalls[0].name, 'send', 'Job name is send');
    assert.strictEqual(
      emailQueueCalls[0].data.to,
      'customer@example.com',
      'Email recipient matches',
    );
    assert(
      emailQueueCalls[0].data.body.includes('Here is the solution'),
      'Email body contains reply',
    );

    // E. Check RAG Update
    // RAG update might be async and not awaited in the main flow?
    // In server.ts: ragService.upsertDoc(...).catch(...)
    // It is NOT awaited. So we might need to wait a bit.
    await sleep(100);
    assert.strictEqual(ragUpsertCalls.length, 1, 'Should trigger RAG upsert');
    assert.strictEqual(ragUpsertCalls[0].docId, ticketId, 'RAG upsert docId matches');
    assert.strictEqual(ragUpsertCalls[0].metadata.status, 'replied', 'RAG metadata status updated');

    console.log('✅ ReplyTicket RPC Integration Test PASSED');
  } catch (error) {
    console.error('❌ Test FAILED:', error);
    process.exit(1);
  } finally {
    // Teardown
    console.log('Cleaning up...');
    if (tenantId) await Tenant.deleteOne({ _id: tenantId });
    if (userId) await User.deleteOne({ _id: userId });
    if (ticketId) await Ticket.deleteOne({ _id: ticketId });
    if (ticketId) await TicketReply.deleteMany({ ticketId });

    // Restore mocks
    (emailSendQueue as any).add = originalQueueAdd;
    RAGService.prototype.upsertDoc = originalUpsertDoc;

    await mongoose.disconnect();
  }
}

runTests();
