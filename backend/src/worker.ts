import { Worker } from 'bullmq';
import { connectDB } from './db';
import TicketReply from './models/TicketReply';
import { EmailService } from './services/EmailService';
import mongoose from 'mongoose';

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

async function start() {
  await connectDB();
  const worker = new Worker(
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
    { connection: buildConnection(), concurrency: Number(process.env.QUEUE_CONCURRENCY || 5) },
  );
  worker.on('failed', () => {});
}

start().catch(async () => {
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
