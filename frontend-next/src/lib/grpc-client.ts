import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load the protobuf definition
const PROTO_PATH = path.resolve(process.cwd(), 'src/proto/ticket.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const ticketProto = grpc.loadPackageDefinition(packageDefinition).ticket as any;

// Create the gRPC client
const grpcServerAddress = process.env.BACKEND_GRPC_URL || 'localhost:50051';
const isSecure = grpcServerAddress.includes(':443') || grpcServerAddress.startsWith('https');
const credentials = isSecure ? grpc.credentials.createSsl() : grpc.credentials.createInsecure();

export const ticketClient = new ticketProto.TicketService(
  grpcServerAddress.replace('https://', ''), // Remove protocol if present
  credentials,
);

// Helper to promisify gRPC calls
export const grpcRequest = <T>(
  method: string,
  request: unknown,
  metadata: Record<string, string> = {},
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const meta = new grpc.Metadata();
    Object.keys(metadata).forEach((key) => {
      meta.add(key, metadata[key]);
    });

    // Dynamic gRPC method call
    ticketClient[method](request, meta, (err: grpc.ServiceError | null, response: T) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};
