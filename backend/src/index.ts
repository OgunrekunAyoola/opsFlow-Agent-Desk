import 'dotenv/config';
import { createServer } from 'http';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { buildConnection, ticketOrchestrationQueue, emailSendQueue } from './queue';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth';
import usersRouter from './routes/users';
import ticketsRouter from './routes/tickets';
import dashboardRouter from './routes/dashboard';
import clientsRouter from './routes/clients';
import emailRouter from './routes/email';
import actionsRouter from './routes/actions';
import eventsRouter from './routes/events';
import notificationsRouter from './routes/notifications';
import zendeskRouter from './routes/zendesk';
import kbRouter from './routes/kb';
import settingsRouter from './routes/settings';
import authRouter from './routes/auth';
import tenantsRouter from './routes/tenants';
import portalRouter from './routes/portal';
import integrationsRouter from './routes/integrations';
import webhooksRouter from './routes/webhooks';
import csatRouter from './routes/csat';
import adminRouter from './routes/admin';
import { tenantMiddleware } from './middleware/tenantMiddleware';
import { requireAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import logger from './shared/utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { tenantRateLimiter } from './middleware/rateLimiter';
import { startGrpcServer } from './grpc/server';
import { initSocket } from './socket';
import { ensureIndexes } from './startup/ensureIndexes';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

logger.info('Starting OpsFlow Backend...');

const app = express();
app.use(requestLogger);
const port = process.env.PORT || 3001;

logger.info(`Configured port: ${port}`);

// Connect to DB but don't block startup
connectDB().then(() => {
  logger.info('DB Connected, ensuring indexes...');
  ensureIndexes().catch(err => logger.error('ensureIndexes failed', err));
});

// Start gRPC Server
startGrpcServer();

const redisConfig = (() => {
  const hasRedisUrl = Boolean(process.env.REDIS_URL);
  const hasRedisHost = Boolean(process.env.REDIS_HOST);
  if (!hasRedisUrl && !hasRedisHost) {
    return null;
  }
  try {
    return buildConnection();
  } catch {
    return null;
  }
})();

const redis = redisConfig && process.env.NODE_ENV !== 'test' ? new Redis(redisConfig as any) : null;

const isReverseProxy =
  Boolean(
    process.env.RENDER ||
    process.env.DYNO ||
    process.env.RAILWAY_STATIC_URL ||
    process.env.FLY_APP_NAME ||
    process.env.VERCEL,
  ) || process.env.NODE_ENV === 'production';
if (isReverseProxy) {
  app.set('trust proxy', 1);
}

const defaultMax = isReverseProxy ? 1000 : 5000;
const configuredMax = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 0;
const rateLimitMax =
  Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : defaultMax;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || (req.connection as any)?.remoteAddress || '';
    return `ip:${ip}`;
  },
});
app.use(helmet());
app.use(cookieParser());
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.all('/api/auth/*path', toNodeHandler(auth) as any);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use(mongoSanitize());
app.use(limiter);
app.use('/auth', authRouter);
app.use('/users', requireAuth, tenantMiddleware, tenantRateLimiter, usersRouter);
app.use('/tickets', requireAuth, tenantMiddleware, tenantRateLimiter, ticketsRouter);
app.use('/tenants', requireAuth, tenantMiddleware, tenantRateLimiter, tenantsRouter);
app.use('/portal', portalRouter); // Portal uses tokens, handles its own isolation
app.use('/dashboard', requireAuth, tenantMiddleware, tenantRateLimiter, dashboardRouter);
app.use('/clients', requireAuth, tenantMiddleware, tenantRateLimiter, clientsRouter);

app.use('/integrations', requireAuth, tenantMiddleware, tenantRateLimiter, integrationsRouter);
app.use('/email', requireAuth, tenantMiddleware, tenantRateLimiter, emailRouter);
app.use('/actions', requireAuth, tenantMiddleware, tenantRateLimiter, actionsRouter);
app.use('/events', requireAuth, tenantMiddleware, tenantRateLimiter, eventsRouter);
app.use('/notifications', requireAuth, tenantMiddleware, tenantRateLimiter, notificationsRouter);
app.use('/integrations/zendesk', requireAuth, tenantMiddleware, tenantRateLimiter, zendeskRouter);
app.use('/kb', requireAuth, tenantMiddleware, tenantRateLimiter, kbRouter);
app.use('/settings', requireAuth, tenantMiddleware, tenantRateLimiter, settingsRouter);
app.use('/webhooks', webhooksRouter); // Webhooks use signatures
app.use('/csat', csatRouter); // CSAT uses tokens
app.use('/admin', adminRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('OpsFlow Agent Desk API');
});

app.get('/health', async (req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;
  let redisOk = true;
  if (redis) {
    try {
      const ping = await Promise.race([
        redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      redisOk = ping === 'PONG';
    } catch {
      redisOk = false;
    }
  }

  res.json({
    status: dbReady && redisOk ? 'ok' : 'degraded',
    timestamp: new Date(),
    services: {
      db: dbReady,
      redis: redisOk
    }
  });
});

app.get('/health/sentry-test', (req: Request, res: Response) => {
  throw new Error('Sentry Test Error');
});

app.get('/ready', async (req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;
  let redisOk = true;
  let queueStats: any = {};

  if (redis) {
    try {
      await Promise.race([
        redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
    } catch {
      redisOk = false;
    }
  }

  try {
    const [orchestrationDepth, emailDepth] = await Promise.all([
      (ticketOrchestrationQueue as any).getJobCounts ? (ticketOrchestrationQueue as any).getJobCounts() : Promise.resolve({}),
      (emailSendQueue as any).getJobCounts ? (emailSendQueue as any).getJobCounts() : Promise.resolve({})
    ]) as any[];
    queueStats = {
      orchestration: orchestrationDepth,
      email: emailDepth
    };
  } catch {}

  const ok = dbReady && redisOk;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    db: dbReady,
    redis: redisOk,
    queues: queueStats
  });
});

// Global Error Handler
// Sentry error handler should be after all controllers but before any other error middleware
Sentry.setupExpressErrorHandler(app);

app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

const server = httpServer.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

function shutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  server.close(() => {
    mongoose
      .disconnect()
      .catch(() => {})
      .finally(() => {
        process.exit(0);
      });
  });
  setTimeout(() => {
    process.exit(1);
  }, 30000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
