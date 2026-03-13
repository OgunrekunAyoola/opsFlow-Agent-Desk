import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import UserAction from '../models/UserAction';
import { tenantScope } from '../shared/utils/tenantGuard';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { page: p, pageSize: ps } = (req.query as any) || {};
  const page = Math.max(parseInt(p || '1', 10), 1);
  const pageSize = Math.max(Math.min(parseInt(ps || '20', 10), 100), 1);

  const scope = { ...tenantScope(tenantId), userId };

  const total = await UserAction.countDocuments(scope).exec();
  const items = await UserAction.find(scope)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .exec();
  res.json({ items, page, pageSize, total });
});

export default router;
