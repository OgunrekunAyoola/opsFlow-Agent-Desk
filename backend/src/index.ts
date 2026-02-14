import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db';
import mongoose from 'mongoose';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import ticketsRouter from './routes/tickets';
import dashboardRouter from './routes/dashboard';
import clientsRouter from './routes/clients';
import emailRouter from './routes/email';

dotenv.config();

console.log('Starting OpsFlow Backend...');

const app = express();
const port = process.env.PORT || 3000;

console.log(`Configured port: ${port}`);

// Connect to DB but don't block startup
connectDB().then(() => console.log('DB Connection attempt finished'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/clients', clientsRouter);
app.use('/email', emailRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('OpsFlow Agent Desk API');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
