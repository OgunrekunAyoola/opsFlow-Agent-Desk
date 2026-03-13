import { Worker } from 'bullmq';
import { connectDB } from './db';
import TicketReply from './models/TicketReply';
import { EmailService } from './services/EmailService';
import { ResolvedTicketEmbeddingService } from './services/ResolvedTicketEmbeddingService';
import mongoose from 'mongoose';
import { TicketOrchestrator } from './core/orchestrator/TicketOrchestrator';
import { executeIntegrationSync } from './services/IntegrationSyncService';
import { slaMonitorWorker } from './workers/slaMonitor.worker';
import { lifecycleWorker } from './workers/lifecycle.worker';
import { slaMonitorQueue, ticketLifecycleQueue } from './queue';
import logger from './shared/utils/logger';
import * as Sentry from '@sentry/node';

function buildConnection() {
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

let emailWorker: Worker;
let snippetWorker: Worker;
let integrationWorker: Worker;
let orchestrationWorker: Worker;

async function start() {
  await connectDB();
  const connection = buildConnection();

  emailWorker = new Worker(
    'email-send',
    async (job) => {
      const data = job.data as {
        replyId: string;
        to: string;
        subject: string;
        body: string;
      };
      const reply = await TicketReply.findById(data.replyId).exec();
      if (!reply) return;
      const email = new EmailService();
      const result = await email.send({ to: data.to, subject: data.subject, text: data.body });
      if (result.status === 'sent' || result.status === 'queued') {
        reply.deliveryStatus = result.status;
        reply.deliveredAt = new Date();
        reply.deliveryProvider = result.provider;
        reply.providerMessageId = result.providerMessageId;
      } else {
        reply.deliveryStatus = 'failed';
        reply.deliveryProvider = result.provider;
        reply.deliveryError = result.error;
      }
      await reply.save();
    },
    { connection, concurrency: Number(process.env.QUEUE_CONCURRENCY || 5) },
  );
  emailWorker.on('failed', (job, err) => {
    logger.error(`[EmailWorker] Job ${job?.id} failed: ${err.message}`);
    Sentry.captureException(err, { tags: { queue: 'email-send', job: job?.id } });
  });

  snippetWorker = new Worker(
    'resolved-snippet',
    async (job) => {
      const data = job.data as {
        tenantId: string;
        ticketId: string;
      };
      const tenantObjectId = new mongoose.Types.ObjectId(data.tenantId);
      const ticketObjectId = new mongoose.Types.ObjectId(data.ticketId);
      const service = new ResolvedTicketEmbeddingService();
      await service.upsertSnippetForTicket(tenantObjectId, ticketObjectId);
    },
    {
      connection,
      concurrency: Number(process.env.SNIPPET_QUEUE_CONCURRENCY || 3),
    },
  );
  snippetWorker.on('failed', (job, err) => {
    logger.error(`[SnippetWorker] Job ${job?.id} failed: ${err.message}`);
    Sentry.captureException(err, { tags: { queue: 'resolved-snippet', job: job?.id } });
  });

  integrationWorker = new Worker(
    'integration-sync',
    async (job) => {
      const { connectionId } = job.data;
      await executeIntegrationSync(connectionId);
    },
    { connection, concurrency: 2 },
  );
  integrationWorker.on('failed', (job, err) => {
    logger.error(`[IntegrationWorker] Job ${job?.id} failed: ${err.message}`);
    Sentry.captureException(err, { tags: { queue: 'integration-sync', job: job?.id } });
  });

  orchestrationWorker = new Worker(
    'ticket-orchestration',
    async (job) => {
      logger.info(`[OrchestrationWorker] Processing job ${job.id}`);
      const { tenantId, ticketId, startedByUserId } = job.data;
      const orchestrator = new TicketOrchestrator();
      await orchestrator.runPipeline(tenantId, ticketId, startedByUserId);
    },
    {
      connection,
      concurrency: Number(process.env.ORCHESTRATION_CONCURRENCY || 5),
    },
  );
  orchestrationWorker.on('failed', (job, err) => {
    logger.error(`[OrchestrationWorker] Job ${job?.id} failed: ${err.message}`);
    Sentry.captureException(err, { tags: { queue: 'ticket-orchestration', job: job?.id } });
  });

  // Schedule SLA monitoring repeatable job (every 5 minutes)
  await slaMonitorQueue.add('check-sla', {}, {
    repeat: {
      pattern: '*/5 * * * *'
    }
  });
  logger.info('[Worker] SLA Monitor repeatable job scheduled.');

  // Schedule Lifecycle repeatable job (every 1 hour)
  await ticketLifecycleQueue.add('check-lifecycle', {}, {
    repeat: {
      pattern: '0 * * * *'
    }
  });
  logger.info('[Worker] Ticket Lifecycle repeatable job scheduled.');
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful worker shutdown...`);
  try {
    await Promise.all([
      emailWorker?.close(),
      snippetWorker?.close(),
      integrationWorker?.close(),
      orchestrationWorker?.close(),
    ]);
    logger.info('All workers closed.');
  } catch (err: any) {
    logger.error(`Error during worker shutdown: ${err.message}`);
  }
  try {
    await mongoose.disconnect();
    logger.info('DB disconnected.');
  } catch {}
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch(async () => {
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
