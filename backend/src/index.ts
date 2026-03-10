import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { buildConnection } from './queue';
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
import integrationsRouter from './routes/integrations';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { startGrpcServer } from './grpc/server';

logger.info('Starting OpsFlow Backend...');

const app = express();
app.use(requestLogger);
const port = process.env.PORT || 3001;

logger.info(`Configured port: ${port}`);

// Connect to DB but don't block startup
connectDB().then(() => logger.info('DB Connection attempt finished'));

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
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use(limiter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/clients', clientsRouter);

app.use('/integrations', integrationsRouter);
app.use('/email', emailRouter);
app.use('/actions', actionsRouter);
app.use('/events', eventsRouter);
app.use('/notifications', notificationsRouter);
app.use('/integrations/zendesk', zendeskRouter);
app.use('/kb', kbRouter);
app.use('/settings', settingsRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('OpsFlow Agent Desk API');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState });
});

app.get('/ready', async (req: Request, res: Response) => {
  const dbReady = mongoose.connection.readyState === 1;
  let redisOk = true;

  if (redis) {
    try {
      await redis.ping();
    } catch {
      redisOk = false;
    }
  }

  const ok = dbReady && redisOk;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
    db: dbReady,
    redis: redis ? redisOk : null,
  });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function shutdown(signal: string) {
  console.log(`Received ${signal}, starting graceful shutdown...`);
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
