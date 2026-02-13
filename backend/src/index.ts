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

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

connectDB();

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('OpsFlow Agent Desk API');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
