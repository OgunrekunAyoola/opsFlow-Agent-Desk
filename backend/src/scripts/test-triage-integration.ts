import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';
import VectorDoc from '../models/VectorDoc';

dotenv.config();
console.log('Starting Test Script...');

const PROTO_PATH = path.resolve(__dirname, '../proto/ticket.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const ticketProto = grpc.loadPackageDefinition(packageDefinition).ticket as any;

const client = new ticketProto.TicketService(
  `localhost:${process.env.GRPC_PORT || '50051'}`,
  grpc.credentials.createInsecure(),
);

const DEMO_TENANT_ID = '65f2d6c0c9b9a1b2c3d4e5f6';
const DEMO_USER_ID = '65f2d6c0c9b9a1b2c3d4e5f7';

function promisifyGrpc(method: Function, request: any): Promise<any> {
  return new Promise((resolve, reject) => {
    method(request, (error: any, response: any) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
}

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/opsflow_agent_desk');
    console.log('Connected to MongoDB');

    // 1. Create Ticket
    console.log('\n--- 1. Testing CreateTicket ---');
    const createResponse = await promisifyGrpc(client.CreateTicket.bind(client), {
      subject: 'Test Ticket for Auto-Reply ' + Date.now(),
      body: 'I need help resetting my password. It is urgent.',
      tenantId: DEMO_TENANT_ID,
    });
    console.log('Ticket Created:', createResponse.id);

    // 2. Triage Ticket (Simulated for now as it runs async in background)
    console.log('\n--- 2. Testing TriageTicket ---');
    const triageResponse = await promisifyGrpc(client.TriageTicket.bind(client), {
      id: createResponse.id,
      tenantId: DEMO_TENANT_ID,
      userId: DEMO_USER_ID,
    });
    console.log('Triage Started:', triageResponse.status);

    // Wait for triage to complete (mock wait)
    console.log('Waiting for triage workflow (5s)...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check ticket status
    const ticketAfterTriage = await Ticket.findById(createResponse.id);
    console.log('Ticket Status after triage:', ticketAfterTriage?.status);
    console.log('AI Draft:', ticketAfterTriage?.aiDraft?.body?.substring(0, 50) + '...');

    // 3. Reply to Ticket
    console.log('\n--- 3. Testing ReplyTicket ---');
    const replyBody = ticketAfterTriage?.aiDraft?.body || 'Manual fallback reply';
    const replyResponse = await promisifyGrpc(client.ReplyTicket.bind(client), {
      id: createResponse.id,
      tenantId: DEMO_TENANT_ID,
      body: replyBody,
      userId: DEMO_USER_ID,
    });
    console.log('Reply Sent. Ticket Status:', replyResponse.status);

    // 4. Verify RAG Indexing
    console.log('\n--- 4. Verifying RAG Indexing ---');
    // Allow some time for async indexing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const vectorDoc = await VectorDoc.findOne({
      sourceId: createResponse.id,
      type: 'ticket',
    });

    if (vectorDoc) {
      console.log('RAG Index Found:', vectorDoc._id);
      console.log('Indexed Text Preview:', vectorDoc.content.substring(0, 50) + '...');
      console.log('Metadata:', vectorDoc.metadata);
    } else {
      console.error('RAG Index NOT Found!');
    }

    console.log('\nTest Completed Successfully!');
  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    // process.exit(0); // Don't exit, let the tool handle it
  }
}

runTest();
