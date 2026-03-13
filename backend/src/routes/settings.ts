import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth, requireAdmin } from '../middleware/auth';
import Tenant from '../models/Tenant';
import logger from '../shared/utils/logger';

const router = Router();

router.get('/ingest-api-key', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  logger.info('GET /ingest-api-key tenantId:', tenantId);

  const tenant = await Tenant.findOne({ _id: tenantId, deletedAt: null }).select('ingestApiKey').exec();
  if (!tenant) {
    logger.info('Tenant not found for ID:', tenantId);
    return res.status(404).json({ error: 'tenant_not_found' });
  }

  // Generate if missing
  if (!tenant.ingestApiKey) {
    logger.info('Generating new API key for tenant:', tenantId);
    tenant.ingestApiKey = crypto.randomBytes(32).toString('hex');
    await tenant.save();
  } else {
    logger.info('Returning existing API key for tenant:', tenantId);
  }

  res.json({ apiKey: tenant.ingestApiKey });
});

router.post('/ingest-api-key/rotate', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const apiKey = crypto.randomBytes(32).toString('hex');
  const tenant = await Tenant.findOneAndUpdate(
    { _id: tenantId, deletedAt: null },
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
  const tenant = await Tenant.findOne({ _id: tenantId, deletedAt: null })
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

  const tenant = await Tenant.findOneAndUpdate({ _id: tenantId, deletedAt: null }, { supportEmail }, { new: true }).exec();

  if (!tenant) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

router.get('/ai-config', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const tenant = await Tenant.findOne({ _id: tenantId, deletedAt: null })
    .select(
      'autoTriageOnInbound autoReplyEnabled autoReplyConfidenceThreshold autoReplySafeCategories aiDraftEnabled aiUsePastTickets',
    )
    .exec();

  if (!tenant) return res.status(404).json({ error: 'not_found' });

  res.json({
    autoTriageOnInbound: tenant.autoTriageOnInbound,
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
    autoTriageOnInbound,
    autoReplyEnabled,
    autoReplyConfidenceThreshold,
    autoReplySafeCategories,
    aiDraftEnabled,
    aiUsePastTickets,
  } = req.body;

  const tenant = await Tenant.findOneAndUpdate(
    { _id: tenantId, deletedAt: null },
    {
      autoTriageOnInbound,
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
