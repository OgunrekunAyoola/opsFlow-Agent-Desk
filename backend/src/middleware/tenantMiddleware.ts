import { Request, Response, NextFunction } from 'express';

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract tenantId from the currentUser object set by requireAuth middleware
  const ctx = (req as any).currentUser;
  
  if (!ctx || !ctx.tenantId) {
    return res.status(403).json({ error: 'Tenant context missing or access denied' });
  }

  // Attach tenantId directly to req for easy access
  req.tenantId = ctx.tenantId;

  next();
}

// Extend Express Request type to include tenantId
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}
