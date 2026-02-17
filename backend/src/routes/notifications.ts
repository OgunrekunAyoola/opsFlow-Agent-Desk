import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import Notification from '../models/Notification';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { limit } = (req.query as any) || {};
  const max = Math.max(Math.min(parseInt(limit || '10', 10), 50), 1);

  const items = await Notification.find({ tenantId: ctx.tenantId, userId: ctx.userId })
    .sort({ createdAt: -1 })
    .limit(max)
    .lean()
    .exec();

  const unreadCount = await Notification.countDocuments({
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    readAt: { $exists: false },
  }).exec();

  res.json({ items, unreadCount });
});

router.post('/mark-all-read', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  await Notification.updateMany(
    { tenantId: ctx.tenantId, userId: ctx.userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  ).exec();
  res.json({ ok: true });
});

router.post('/:id/read', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const { id } = req.params;
  const notif = await Notification.findOneAndUpdate(
    { _id: id, tenantId: ctx.tenantId, userId: ctx.userId },
    { $set: { readAt: new Date() } },
    { new: true },
  ).exec();
  if (!notif) return res.status(404).json({ error: 'not_found' });
  res.json(notif);
});

export default router;

