import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../auth';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  auth.api
    .getSession({ headers: fromNodeHeaders(req.headers) })
    .then((session) => {
      if (!session || !session.user) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      const activeOrganizationId =
        (session as any).session && (session as any).session.activeOrganizationId;
      (req as any).currentUser = {
        userId: session.user.id,
        tenantId: activeOrganizationId,
        session,
      };
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'unauthorized' });
    });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const ctx = (req as any).currentUser;
  if (!ctx) return res.status(401).json({ error: 'unauthorized' });
  next();
}
