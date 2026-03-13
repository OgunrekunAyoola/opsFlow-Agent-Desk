import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { buildConnection } from '../queue';
import logger from '../shared/utils/logger';
import Tenant from '../models/Tenant';

const redisConfig = buildConnection();
const redis = new Redis(redisConfig as any);

const limiters = {
  starter: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl_starter',
    points: 100, // 100 requests
    duration: 60 * 15, // per 15 minutes
  }),
  growth: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl_growth',
    points: 500,
    duration: 60 * 15,
  }),
  enterprise: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl_enterprise',
    points: 2000,
    duration: 60 * 15,
  }),
};

export const tenantRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = (req as any).currentUser?.tenantId;
  
  if (!tenantId) {
    return next();
  }

  try {
    const tenant = await Tenant.findById(tenantId).select('tier').lean().exec();
    const tier = (tenant?.tier as 'starter' | 'growth' | 'enterprise') || 'starter';
    const limiter = limiters[tier];

    await limiter.consume(tenantId);
    next();
  } catch (rejRes: any) {
    if (rejRes instanceof Error) {
      logger.error(`Rate limiter error: ${rejRes.message}`);
      return next(); // Don't block on Redis error
    }
    
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
};
