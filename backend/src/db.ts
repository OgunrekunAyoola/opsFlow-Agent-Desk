import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './shared/utils/logger';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opsflow';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('MongoDB Connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
  }
};
