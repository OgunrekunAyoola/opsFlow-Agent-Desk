import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import Tenant from '../models/Tenant';
import logger from '../shared/utils/logger';

const router = Router();

router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = (req as any).currentUser;

    if (id !== tenantId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const {
      onboarded,
      industry,
      teamSize,
      brandTone,
      escalationThreshold,
      supportEmail,
      name,
    } = req.body;

    const tenant = await Tenant.findOneAndUpdate(
      { _id: id, deletedAt: null },
      {
        onboarded,
        industry,
        teamSize,
        brandTone,
        escalationThreshold,
        ...(supportEmail && { supportEmail }),
        ...(name && { name }),
      },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ error: 'tenant_not_found' });
    }

    res.json({ ok: true, tenant });
  } catch (error) {
    logger.error('Failed to update tenant:', error);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

export default router;
