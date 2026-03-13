import { Queue } from 'bullmq';
import { ResolvedTicketEmbeddingService } from '../services/ResolvedTicketEmbeddingService';
import mongoose from 'mongoose';
import logger from '../shared/utils/logger';

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

logger.info(`[Queue] Initializing... shouldUseMock=${shouldUseMock}`);

class MockQueue {
  async add(_name: string, _data: any) {
    logger.info(`[MockQueue] Adding job ${_name}`, _data);
    return { id: 'mock', name: _name };
  }
}

class MockResolvedQueue {
  async add(name: string, data: any) {
    logger.info(`[MockResolvedQueue] Processing job ${name} directly (no Redis)`, data);
    if (name === 'upsert') {
      (async () => {
        try {
          const service = new ResolvedTicketEmbeddingService();
          await service.upsertSnippetForTicket(
            new mongoose.Types.ObjectId(data.tenantId),
            new mongoose.Types.ObjectId(data.ticketId),
          );
        } catch (e: any) {
          logger.error(`[MockResolvedQueue] Failed to process job: ${e.message}`);
        }
      })();
    }
    return { id: 'mock-direct', name };
  }
}

export const defaultJobOptions = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: {
    age: 3600, // keep for 1 hour
    count: 1000,
  },
  removeOnFail: {
    age: 24 * 3600 * 7, // keep for 7 days
  },
};

const connection = buildConnection();

export const emailSendQueue = shouldUseMock
  ? new MockQueue()
  : new Queue('email-send', { connection, defaultJobOptions });

export const resolvedSnippetQueue = shouldUseMock
  ? new MockResolvedQueue()
  : new Queue('resolved-snippet', { connection, defaultJobOptions });

export const integrationSyncQueue = shouldUseMock
  ? new MockQueue()
  : new Queue('integration-sync', { connection, defaultJobOptions });

export const ticketOrchestrationQueue = shouldUseMock
  ? new MockQueue()
  : new Queue('ticket-orchestration', { connection, defaultJobOptions });

export const slaMonitorQueue = shouldUseMock
  ? new MockQueue()
  : new Queue('sla-monitor', { connection, defaultJobOptions });

export const ticketLifecycleQueue = shouldUseMock
  ? new MockQueue()
  : new Queue('ticket-lifecycle', { connection, defaultJobOptions });

export const dlqQueue = shouldUseMock
  ? new MockQueue()
  : new Queue('dlq', { connection });
