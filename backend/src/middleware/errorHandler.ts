import { Request, Response, NextFunction } from 'express';
import logger from '../shared/utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't leak stack traces in production
  const response = {
    error: statusCode === 500 ? 'internal_server_error' : 'error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Something went wrong' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
