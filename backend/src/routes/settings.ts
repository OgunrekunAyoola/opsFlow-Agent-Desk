import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth, requireAdmin } from '../middleware/auth';
import Tenant from '../models/Tenant';

const router = Router();

router.get('/ingest-api-key', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  console.log('GET /ingest-api-key tenantId:', tenantId);

  const tenant = await Tenant.findById(tenantId).select('ingestApiKey').exec();
  if (!tenant) {
    console.log('Tenant not found for ID:', tenantId);
    return res.status(404).json({ error: 'tenant_not_found' });
  }

  // Generate if missing
  if (!tenant.ingestApiKey) {
    console.log('Generating new API key for tenant:', tenantId);
    tenant.ingestApiKey = crypto.randomBytes(32).toString('hex');
    await tenant.save();
  } else {
    console.log('Returning existing API key for tenant:', tenantId);
  }

  res.json({ apiKey: tenant.ingestApiKey });
});

router.post('/ingest-api-key/rotate', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const apiKey = crypto.randomBytes(32).toString('hex');
  const tenant = await Tenant.findOneAndUpdate(
    { _id: tenantId },
    { ingestApiKey: apiKey },
    { new: true },
  ).exec();
  if (!tenant) {
    return res.status(404).json({ error: 'tenant_not_found' });
  }
  res.json({ apiKey: tenant.ingestApiKey });
});

router.get('/email-config', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const tenant = await Tenant.findById(tenantId)
    .select('inboundAddress inboundSecret supportEmail')
    .exec();
  if (!tenant) return res.status(404).json({ error: 'not_found' });

  // Generate if missing
  if (!tenant.inboundAddress) {
    const random = crypto.randomBytes(4).toString('hex');
    tenant.inboundAddress = `support-${random}@inbound.opsflow.ai`;
    tenant.inboundSecret = crypto.randomBytes(16).toString('hex');
    await tenant.save();
  }

  res.json({
    inboundAddress: tenant.inboundAddress,
    inboundSecret: tenant.inboundSecret,
    supportEmail: tenant.supportEmail,
  });
});

router.post('/email-config', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { supportEmail } = req.body;

  const tenant = await Tenant.findByIdAndUpdate(tenantId, { supportEmail }, { new: true }).exec();

  if (!tenant) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

router.get('/ai-config', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const tenant = await Tenant.findById(tenantId)
    .select(
      'autoReplyEnabled autoReplyConfidenceThreshold autoReplySafeCategories aiDraftEnabled aiUsePastTickets',
    )
    .exec();

  if (!tenant) return res.status(404).json({ error: 'not_found' });

  res.json({
    autoReplyEnabled: tenant.autoReplyEnabled,
    autoReplyConfidenceThreshold: tenant.autoReplyConfidenceThreshold,
    autoReplySafeCategories: tenant.autoReplySafeCategories,
    aiDraftEnabled: tenant.aiDraftEnabled,
    aiUsePastTickets: tenant.aiUsePastTickets,
  });
});

router.post('/ai-config', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const {
    autoReplyEnabled,
    autoReplyConfidenceThreshold,
    autoReplySafeCategories,
    aiDraftEnabled,
    aiUsePastTickets,
  } = req.body;

  const tenant = await Tenant.findByIdAndUpdate(
    tenantId,
    {
      autoReplyEnabled,
      autoReplyConfidenceThreshold,
      autoReplySafeCategories,
      aiDraftEnabled,
      aiUsePastTickets,
    },
    { new: true },
  ).exec();

  if (!tenant) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

export default router;
