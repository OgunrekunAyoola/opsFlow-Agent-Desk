import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Notification from '../models/Notification';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const users = await User.find({ tenantId: ctx.tenantId })
    .select('name email role createdAt updatedAt')
    .exec();
  res.json({ users });
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'invalid' });
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    tenantId: ctx.tenantId,
    name,
    email,
    passwordHash: hash,
    role: role === 'admin' ? 'admin' : 'member',
  });

  try {
    const admins = await User.find({
      tenantId: ctx.tenantId,
      role: 'admin',
      _id: { $ne: user._id },
    })
      .select('_id')
      .exec();
    if (admins.length > 0) {
      const message = `${user.name || user.email} joined the team`;
      const url = '/team';
      await Notification.insertMany(
        admins.map((admin) => ({
          tenantId: ctx.tenantId,
          userId: admin._id,
          type: 'team_member_joined',
          message,
          url,
        })),
      );
    }
  } catch {}

  res
    .status(201)
    .json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export default router;
