import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import Tenant from '../models/Tenant';

const router = Router();

router.get('/status', requireAuth, requireAdmin, async (req, res) => {
  const ctx = (req as any).currentUser;
  const tenant = await Tenant.findOne({ _id: ctx.tenantId, deletedAt: null }).exec();
  if (!tenant) return res.status(404).json({ error: 'not_found' });

  const connected = Boolean(tenant.zendeskToken && tenant.zendeskSubdomain);

  res.json({
    connected,
    subdomain: tenant.zendeskSubdomain || null,
    clientId: tenant.zendeskClientId || null,
    hasRefreshToken: Boolean(tenant.zendeskRefreshToken),
  });
});

export default router;

