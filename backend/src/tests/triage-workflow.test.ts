import mongoose from 'mongoose';
import dotenv from 'dotenv';
import assert from 'assert';
import { TicketTriageWorkflow } from '../services/TicketTriageWorkflow';
import Ticket from '../models/Ticket';
import Tenant from '../models/Tenant';
import User from '../models/User';
import TicketReply from '../models/TicketReply';
import WorkflowRun from '../models/WorkflowRun';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/opsflow_test';

// Test Setup
async function setup() {
  console.log('Connecting to Test DB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  // Clear DB
  await Ticket.deleteMany({});
  await Tenant.deleteMany({});
  await User.deleteMany({});
  await TicketReply.deleteMany({});
  await WorkflowRun.deleteMany({});
}

async function teardown() {
  await mongoose.disconnect();
  console.log('Test DB Disconnected');
}

// Test Suite
async function runTests() {
  await setup();

  try {
    console.log('\n--- Running TicketTriageWorkflow Unit/Integration Tests ---');

    // 1. Create Data
    const tenant = await Tenant.create({ name: 'Test Tenant', domain: 'test.com' });
    const user = await User.create({
      tenantId: tenant._id,
      email: 'agent@test.com',
      name: 'Agent Smith',
      role: 'member',
      passwordHash: 'hash',
    });

    const ticket = await Ticket.create({
      tenantId: tenant._id,
      subject: 'My order is broken',
      body: 'I received a damaged item yesterday. Need refund.',
      status: 'new',
      priority: 'medium',
      customerEmail: 'cust@example.com',
      source: 'email',
      channel: 'email',
    });

    console.log('Created Ticket:', ticket._id);

    // 2. Instantiate Workflow
    const workflow = new TicketTriageWorkflow();

    // 3. Mock LLM Service (Unit Test Approach)
    // We replace the real service with a mock to control outputs and avoid API calls
    const mockLlmService = {
      classifyTicket: async () => ({
        category: 'billing', // MUST be a valid enum value
        confidence: 0.95,
        priority: 'high',
        summary: 'Customer requesting refund for damaged item',
        sentiment: 'negative',
      }),
      prioritizeTicket: async () => ({
        priority: 'high',
        confidence: 0.9,
      }),
      suggestAssignee: async () => ({
        assigneeId: null,
        reason: 'No suitable assignee found',
      }),
      draftReply: async () => ({
        replyBody: 'Here is a draft response regarding your refund request...',
        confidence: 0.88,
        reasoning: 'Based on policy regarding damaged goods.',
        references: [],
      }),
      selfEvaluate: async () => ({
        faithfulness: 'high',
        completeness: 'high',
        risk: 'low',
        explanation: 'Good reply',
      }),
      getActionService: () => ({
        executeTool: async () => ({ success: true, message: 'Refund processed' }),
      }),
      generateResponse: async () => ({
        body: 'Here is a draft response regarding your refund request...',
        confidence: 0.88,
        reasoning: 'Based on policy regarding damaged goods.',
        references: [],
      }),
      determineAction: async () => ({
        actionName: 'refund_order',
        args: { orderId: 'UNKNOWN', reason: 'damaged' },
        confidence: 0.9,
      }),
    };

    // Monkey-patch the private property (TypeScript allows this with 'as any')
    (workflow as any).llmService = mockLlmService;

    // Mock RAG Service (optional, but good practice)
    (workflow as any).snippetEmbedding = {
      embedText: async () => Array(768).fill(0.1),
    };

    // 4. Run Workflow
    console.log('Executing Workflow...');
    await workflow.run({
      tenantId: tenant._id.toString(),
      ticketId: ticket._id.toString(),
      startedByUserId: user._id.toString(),
    });

    // 5. Assertions
    console.log('Verifying Results...');

    // 5.1 Check Ticket Updates (Classification)
    const updatedTicket = await Ticket.findById(ticket._id);
    assert(updatedTicket, 'Ticket should exist');
    assert.strictEqual(
      updatedTicket?.category,
      'billing',
      'Category should be set to "billing" by LLM',
    );
    assert.strictEqual(updatedTicket?.priority, 'high', 'Priority should be updated to high');
    assert.strictEqual(updatedTicket?.aiAnalysis?.sentiment, 'negative', 'Sentiment should be set');

    // 5.2 Check AI Draft (Reply)
    // The draft is stored in Ticket.aiDraft AND a TicketReply is created
    assert(
      updatedTicket?.aiDraft?.body?.includes('draft response'),
      'Ticket.aiDraft body should match LLM output',
    );
    assert.strictEqual(
      updatedTicket?.aiDraft?.confidence,
      0.88,
      'Ticket.aiDraft confidence should be saved',
    );

    const reply = await TicketReply.findOne({
      ticketId: ticket._id,
      authorType: 'ai',
      isInternalNote: { $ne: true },
    });
    assert(reply, 'AI TicketReply should be created');
    assert(reply?.body.includes('draft response'), 'TicketReply body should match LLM output');

    // 5.3 Check Workflow Run Status
    const run = await WorkflowRun.findOne({ ticketId: ticket._id });
    assert(run, 'WorkflowRun should exist');
    assert.strictEqual(run?.status, 'succeeded', 'Workflow run should be completed');

    console.log('✅ TicketTriageWorkflow Tests PASSED');
  } catch (error) {
    console.error('❌ Tests FAILED:', error);
    process.exit(1);
  } finally {
    await teardown();
  }
}

runTests();
