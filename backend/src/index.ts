import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db';
import mongoose from 'mongoose';
import betterAuthRouter from './routes/auth-better';
import usersRouter from './routes/users';
import ticketsRouter from './routes/tickets';
import dashboardRouter from './routes/dashboard';
import clientsRouter from './routes/clients';
import emailRouter from './routes/email';
import actionsRouter from './routes/actions';
import notificationsRouter from './routes/notifications';
import zendeskRouter from './routes/zendesk';
import kbRouter from './routes/kb';
import settingsRouter from './routes/settings';

dotenv.config();

console.log('Starting OpsFlow Backend...');

const app = express();
const port = process.env.PORT || 3000;

console.log(`Configured port: ${port}`);

// Connect to DB but don't block startup
connectDB().then(() => console.log('DB Connection attempt finished'));

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
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl) {
  app.use(
    cors({
      origin: frontendUrl,
      credentials: true,
    }),
  );
} else {
  app.use(cors());
}
app.use('/api/auth', betterAuthRouter);
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use(limiter);
app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/clients', clientsRouter);
app.use('/email', emailRouter);
app.use('/actions', actionsRouter);
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
