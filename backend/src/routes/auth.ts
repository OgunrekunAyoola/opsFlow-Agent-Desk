import { Router } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { requireAuth, ensureCurrentUser } from '../middleware/auth';
import Tenant from '../models/Tenant';
import { auth } from '../auth';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const user = await ensureCurrentUser(req);
  if (!ctx || !ctx.session || !ctx.session.user || !user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const tenantId = ctx.tenantId;
  let tenant = null;
  if (tenantId) {
    tenant = await Tenant.findById(tenantId).exec();
  }
  const sessionUser = ctx.session.user as any;
  res.json({
    user: {
      id: user._id.toString(),
      name: sessionUser.name || user.name,
      email: sessionUser.email || user.email,
      role: user.role,
    },
    tenant: tenant
      ? {
          id: tenant._id.toString(),
          name: tenant.name,
          supportEmail: tenant.supportEmail || null,
          autoReplyEnabled:
            typeof tenant.autoReplyEnabled === 'boolean' ? tenant.autoReplyEnabled : false,
          autoReplyConfidenceThreshold:
            typeof tenant.autoReplyConfidenceThreshold === 'number'
              ? tenant.autoReplyConfidenceThreshold
              : 0.9,
          autoReplySafeCategories:
            Array.isArray(tenant.autoReplySafeCategories) &&
            tenant.autoReplySafeCategories.length > 0
              ? tenant.autoReplySafeCategories
              : ['general', 'feature_request'],
          aiDraftEnabled: typeof tenant.aiDraftEnabled === 'boolean' ? tenant.aiDraftEnabled : true,
          aiUsePastTickets:
            typeof tenant.aiUsePastTickets === 'boolean' ? tenant.aiUsePastTickets : true,
          inboundAddress: tenant.inboundAddress || null,
          lastInboundAt: tenant.lastInboundAt || null,
        }
      : null,
  });
});

router.patch('/tenant-settings', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const user = await ensureCurrentUser(req);
  if (!ctx || !user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const tenantId = ctx.tenantId;
  if (!tenantId) {
    return res.status(400).json({ error: 'no_tenant' });
  }
  const { supportEmail, aiDraftEnabled, aiUsePastTickets } = req.body || {};
  const tenant = await Tenant.findById(tenantId).exec();
  if (!tenant) {
    return res.status(404).json({ error: 'tenant_not_found' });
  }
  if (typeof supportEmail === 'string') {
    tenant.supportEmail = supportEmail || undefined;
  }
  if (typeof aiDraftEnabled === 'boolean') {
    tenant.aiDraftEnabled = aiDraftEnabled;
  }
  if (typeof aiUsePastTickets === 'boolean') {
    tenant.aiUsePastTickets = aiUsePastTickets;
  }
  await tenant.save();
  res.json({
    supportEmail: tenant.supportEmail || null,
    aiDraftEnabled: tenant.aiDraftEnabled,
    aiUsePastTickets: tenant.aiUsePastTickets,
  });
});

router.patch('/auto-reply-settings', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const user = await ensureCurrentUser(req);
  if (!ctx || !user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const tenantId = ctx.tenantId;
  if (!tenantId) {
    return res.status(400).json({ error: 'no_tenant' });
  }
  const { enabled, confidenceThreshold, safeCategories } = req.body || {};
  const tenant = await Tenant.findById(tenantId).exec();
  if (!tenant) {
    return res.status(404).json({ error: 'tenant_not_found' });
  }
  if (typeof enabled === 'boolean') {
    tenant.autoReplyEnabled = enabled;
  }
  if (typeof confidenceThreshold === 'number') {
    tenant.autoReplyConfidenceThreshold = confidenceThreshold;
  }
  if (Array.isArray(safeCategories)) {
    tenant.autoReplySafeCategories = safeCategories.filter(
      (v) => typeof v === 'string' && v.length > 0,
    );
  }
  await tenant.save();
  res.json({
    autoReplyEnabled: tenant.autoReplyEnabled,
    autoReplyConfidenceThreshold: tenant.autoReplyConfidenceThreshold,
    autoReplySafeCategories: tenant.autoReplySafeCategories,
  });
});

router.post('/logout', async (req, res) => {
  try {
    await auth.api.signOut({ headers: fromNodeHeaders(req.headers) });
  } catch {}
  res.json({ ok: true });
});

export default router;
