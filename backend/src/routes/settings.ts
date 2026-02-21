import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth, requireAdmin } from '../middleware/auth';
import Tenant from '../models/Tenant';

const router = Router();

router.get('/ingest-api-key', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const tenant = await Tenant.findById(tenantId).select('ingestApiKey').exec();
  if (!tenant) {
    return res.status(404).json({ error: 'tenant_not_found' });
  }
  res.json({ apiKey: tenant.ingestApiKey || null });
});

router.post('/ingest-api-key/rotate', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const apiKey = crypto.randomBytes(32).toString('hex');
  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    { ingestApiKey: apiKey },
    { new: true, select: 'ingestApiKey' },
  ).exec();
  if (!tenant) {
    return res.status(404).json({ error: 'tenant_not_found' });
  }
  res.json({ apiKey: tenant.ingestApiKey });
});

export default router;

