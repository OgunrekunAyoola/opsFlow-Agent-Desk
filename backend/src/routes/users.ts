import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const ctx = (req as any).currentUser;
  const users = await User.find({ tenantId: ctx.tenantId }).select('name email role createdAt updatedAt').exec();
  res.json({ users });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'invalid' });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ tenantId: ctx.tenantId, name, email, passwordHash: hash, role: role === 'admin' ? 'admin' : 'member' });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export default router;
