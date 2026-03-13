import { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import * as Sentry from '@sentry/node';
import { auth } from '../auth';
import User from '../models/User';
import Tenant from '../models/Tenant';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session || !session.user) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const sessionUser = session.user as any;
    const email = (sessionUser.email as string | undefined)?.toLowerCase();
    if (!email) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    let tenantId =
      ((session as any).session && (session as any).session.activeOrganizationId) || undefined;

    if (!tenantId) {
      let existingUser = await User.findOne({ email }).exec();
      if (existingUser) {
        tenantId = existingUser.tenantId.toString();
      } else {
        const tenant = await Tenant.create({
          name: sessionUser.name || email,
        });
        await User.create({
          tenantId: tenant._id,
          name: sessionUser.name || email,
          email,
          passwordHash: 'better-auth',
          role: 'admin',
          isEmailVerified: !!sessionUser.emailVerified,
        });
        tenantId = tenant._id.toString();
      }
    }

    (req as any).currentUser = {
      userId: session.user.id,
      tenantId,
      session,
    };

    Sentry.setUser({ 
      id: session.user.id, 
      email: session.user.email,
      tenantId: tenantId
    });

    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

export async function ensureCurrentUser(req: Request) {
  const ctx = (req as any).currentUser;
  if (!ctx || !ctx.session || !ctx.session.user || !ctx.tenantId) {
    return null;
  }
  const sessionUser = ctx.session.user as any;
  const email = sessionUser.email as string | undefined;
  if (!email) {
    return null;
  }
  const lower = email.toLowerCase();
  let user = await User.findOne({ tenantId: ctx.tenantId, email: lower }).exec();
  if (!user) {
    const count = await User.countDocuments({ tenantId: ctx.tenantId }).exec();
    const role = count === 0 ? 'admin' : 'member';
    const name = (sessionUser.name as string | undefined) || lower;
    const isEmailVerified = !!sessionUser.emailVerified;
    user = await User.create({
      tenantId: ctx.tenantId,
      name,
      email: lower,
      passwordHash: 'better-auth',
      role,
      isEmailVerified,
    });
  }
  return user;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const ctx = (req as any).currentUser;
  if (!ctx) return res.status(401).json({ error: 'unauthorized' });
  try {
    const user = await ensureCurrentUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  } catch {
    res.status(500).json({ error: 'internal_error' });
  }
}
