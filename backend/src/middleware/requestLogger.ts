import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate a unique ID for the request or use the incoming one
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // Attach it to the request object so downstream controllers can use it
  (req as any).requestId = requestId;
  
  // Set it on the response header so the client knows it
  res.setHeader('X-Request-ID', requestId);

  const start = Date.now();
  
  // Log the incoming request
  logger.http({
    message: 'Incoming Request',
    method: req.method,
    url: req.url,
    requestId: requestId,
    ip: req.ip,
  });

  // Log the response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
        message: 'Request Completed',
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        requestId: requestId,
    });
  });

  next();
};
