import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, refreshCookieOptions, refreshCookieName, verifyToken } from '../auth/jwt';
import Tenant from '../models/Tenant';
import User from '../models/User';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/signup', async (req, res) => {
  const { tenantName, name, email, password } = req.body || {};
  if (!tenantName || !name || !email || !password) return res.status(400).json({ error: 'invalid' });
  const tenant = await Tenant.create({ name: tenantName });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ tenantId: tenant._id, name, email, passwordHash: hash, role: 'admin' });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  res.cookie(refreshCookieName, refresh, refreshCookieOptions);
  res.json({ access_token: access, user: { id: user._id, name: user.name, email: user.email, role: user.role }, tenant: { id: tenant._id, name: tenant.name } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'invalid' });
  const user = await User.findOne({ email }).exec();
  if (!user) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid' });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  res.cookie(refreshCookieName, refresh, refreshCookieOptions);
  res.json({ access_token: access, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

router.post('/refresh', async (req, res) => {
  const token = (req as any).cookies?.[refreshCookieName];
  if (!token) return res.status(401).json({ error: 'invalid' });
  try {
    const p = verifyToken(token) as any;
    if (p.type !== 'refresh') return res.status(401).json({ error: 'invalid' });
    const user = await User.findById(p.sub).exec();
    if (!user) return res.status(401).json({ error: 'invalid' });
    const access = signAccessToken(user);
    res.json({ access_token: access });
  } catch {
    res.status(401).json({ error: 'invalid' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(refreshCookieName, { path: '/auth/refresh' });
  res.status(204).end();
});

router.get('/me', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const user = await User.findById(ctx.userId).exec();
  const tenant = await Tenant.findById(ctx.tenantId).exec();
  res.json({ user: { id: user?._id, name: user?.name, email: user?.email, role: user?.role }, tenant: { id: tenant?._id, name: tenant?.name } });
});

export default router;
