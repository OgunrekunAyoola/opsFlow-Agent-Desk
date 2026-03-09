import { Queue } from 'bullmq';
import { ResolvedTicketEmbeddingService } from '../services/ResolvedTicketEmbeddingService';
import mongoose from 'mongoose';

export function buildConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      const u = new URL(url);
      const tls = u.protocol === 'rediss:' ? {} : undefined;
      return {
        host: u.hostname,
        port: Number(u.port || 6379),
        username: u.username || undefined,
        password: u.password || undefined,
        tls,
      } as any;
    } catch {
      return {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      } as any;
    }
  }
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  } as any;
}

export const shouldUseMock =
  !process.env.REDIS_URL && !process.env.REDIS_HOST && process.env.NODE_ENV !== 'production';

console.log(`[Queue] Initializing... shouldUseMock=${shouldUseMock}`);

class MockQueue {
  async add(_name: string, _data: any) {
    console.log(`[MockQueue] Adding job ${_name}`, _data);
    return { id: 'mock', name: _name };
  }
}

class MockResolvedQueue {
  async add(name: string, data: any) {
    console.log(`[MockResolvedQueue] Processing job ${name} directly (no Redis)`, data);
    if (name === 'upsert') {
      // Fire and forget (don't await to avoid blocking response)
      (async () => {
        try {
          const service = new ResolvedTicketEmbeddingService();
          await service.upsertSnippetForTicket(
            new mongoose.Types.ObjectId(data.tenantId),
            new mongoose.Types.ObjectId(data.ticketId),
          );
        } catch (e) {
          console.error('[MockResolvedQueue] Failed to process job', e);
        }
      })();
    }
    return { id: 'mock-direct', name };
  }
}

export const emailSendQueue: { add: (name: string, data: any) => Promise<any> } = shouldUseMock
  ? new MockQueue()
  : new Queue('email-send', { connection: buildConnection() });

export const resolvedSnippetQueue: {
  add: (name: string, data: any) => Promise<any>;
} = shouldUseMock
  ? new MockResolvedQueue()
  : new Queue('resolved-snippet', { connection: buildConnection() });

export const integrationSyncQueue: {
  add: (name: string, data: any) => Promise<any>;
} = shouldUseMock
  ? new MockQueue()
  : new Queue('integration-sync', { connection: buildConnection() });
