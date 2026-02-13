import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const p = jwt.verify(token, SECRET) as any;
    (req as any).currentUser = { userId: p.sub, tenantId: p.tenant_id, role: p.role };
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const ctx = (req as any).currentUser;
  if (!ctx || ctx.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  next();
}
