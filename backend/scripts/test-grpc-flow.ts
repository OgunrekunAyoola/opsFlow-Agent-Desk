import mongoose from 'mongoose';
import { startGrpcServer } from '../src/grpc/server';
import { connectDB } from '../src/db';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Mock Client Setup
const PROTO_PATH = path.resolve(__dirname, '../src/proto/ticket.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const ticketProto = grpc.loadPackageDefinition(packageDefinition).ticket as any;
const client = new ticketProto.TicketService('localhost:50051', grpc.credentials.createInsecure());

async function runTest() {
  console.log('--- Starting Integration Test ---');

  // 1. Connect DB
  await connectDB();

  // 2. Start Server
  startGrpcServer();

  // Give it a second to start
  await new Promise((r) => setTimeout(r, 1000));

  const tenantId = new mongoose.Types.ObjectId().toString();
  const requestId = uuidv4();

  console.log(`\n[Test] 1. Creating Ticket via gRPC (Trace: ${requestId})`);

  const createPromise = new Promise((resolve, reject) => {
    const meta = new grpc.Metadata();
    meta.add('x-request-id', requestId);

    client.CreateTicket(
      {
        subject: 'Integration Test Ticket',
        body: 'This is a test ticket created by the verification script.',
        tenantId,
      },
      meta,
      (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      },
    );
  });

  try {
    const createdTicket: any = await createPromise;
    console.log('[Test] Created Ticket:', createdTicket);

    console.log(`\n[Test] 2. Fetching Ticket via gRPC`);
    const getPromise = new Promise((resolve, reject) => {
      const meta = new grpc.Metadata();
      meta.add('x-request-id', requestId);

      client.GetTicket(
        {
          id: createdTicket.id,
          tenantId,
        },
        meta,
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response);
        },
      );
    });

    const fetchedTicket: any = await getPromise;
    console.log('[Test] Fetched Ticket:', fetchedTicket);

    console.log(`\n[Test] 3. Updating Ticket via gRPC`);
    const updatePromise = new Promise((resolve, reject) => {
      const meta = new grpc.Metadata();
      meta.add('x-request-id', requestId);

      client.UpdateTicket(
        {
          id: createdTicket.id,
          tenantId,
          status: 'triaged',
          priority: 'high',
        },
        meta,
        (err: any, response: any) => {
          if (err) reject(err);
          else resolve(response);
        },
      );
    });

    const updatedTicket: any = await updatePromise;
    console.log('[Test] Updated Ticket:', updatedTicket);

    if (updatedTicket.status === 'triaged' && updatedTicket.priority === 'high') {
      console.log('\nSUCCESS: Full gRPC Flow Verified!');
    } else {
      console.error('\nFAILURE: Update failed');
    }
  } catch (err) {
    console.error('\nFAILURE:', err);
  }

  process.exit(0);
}

runTest();
