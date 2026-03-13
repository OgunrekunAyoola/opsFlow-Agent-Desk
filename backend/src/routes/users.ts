import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { UserService } from '../services/UserService';

const router = Router();
const userService = new UserService();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const ctx = (req as any).currentUser;
    const users = await userService.listUsers(ctx.tenantId);
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const ctx = (req as any).currentUser;
    const user = await userService.createUser(ctx.tenantId, req.body || {});
    res.status(201).json({ user });
  } catch (err: any) {
    if (err.message === 'invalid') return res.status(400).json({ error: 'invalid' });
    next(err);
  }
});

export default router;
