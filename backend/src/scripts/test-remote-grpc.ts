
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, '../proto/ticket.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const ticketProto = grpc.loadPackageDefinition(packageDefinition).ticket as any;

const TARGET = 'opsflow-backend-production.up.railway.app:443';

console.log(`Connecting to gRPC server at ${TARGET}...`);

const client = new ticketProto.TicketService(
  TARGET,
  grpc.credentials.createSsl()
);

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);

client.waitForReady(deadline, (err: any) => {
  if (err) {
    console.error('Failed to connect:', err);
    process.exit(1);
  } else {
    console.log('Successfully connected to gRPC server!');
    
    // Try to list tickets (should fail with auth or return empty, but proves connection)
    client.ListTickets({ tenantId: 'test', page: 1, limit: 1 }, (err: any, response: any) => {
      if (err) {
        console.log('Call failed (expected if auth required):', err.message);
      } else {
        console.log('Call succeeded:', response);
      }
      process.exit(0);
    });
  }
});
