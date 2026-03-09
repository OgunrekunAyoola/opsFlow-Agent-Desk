import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import IntegrationConnection from '../models/IntegrationConnection';
import { integrationRegistry } from '../integrations';
import { IntegrationProvider } from '../integrations/base';
import SyncedObject from '../models/SyncedObject';
import Ticket from '../models/Ticket';
import { scheduleIntegrationSync } from '../services/IntegrationSyncService';

const router = Router();

// List all available providers and current connections
router.get('/', requireAuth, async (req, res) => {
  const ctx = (req as any).currentUser;
  const connections = await IntegrationConnection.find({ tenantId: ctx.tenantId });

  const providers = integrationRegistry.getAll().map((p) => {
    const conn = connections.find((c) => c.provider === p.name);
    return {
      name: p.name,
      displayName: p.displayName,
      description: p.description,
      iconUrl: p.iconUrl,
      authType: p.authType,
      connection: conn
        ? {
            id: conn._id,
            status: conn.status,
            lastSyncAt: conn.lastSyncAt,
            profile: conn.profile,
          }
        : null,
    };
  });

  res.json({ providers });
});

// Start connection flow
router.post('/:provider/connect', requireAuth, requireAdmin, async (req, res) => {
  const { provider } = req.params;
  const p = integrationRegistry.get(provider as string);
  if (!p) return res.status(404).json({ error: 'provider_not_found' });

  // For OAuth2, return auth URL
  if (p.authType === 'oauth2') {
    // Generate state with tenantId to verify later if needed, but here we just return URL
    // In a real app, we should store state in Redis/Cookie to prevent CSRF
    const url = p.getAuthUrl(`tenant:${(req as any).currentUser.tenantId}`);
    return res.json({ url });
  }

  // For API Key, expected to receive key in body
  if (p.authType === 'api_key') {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'api_key_required' });
    }

    try {
      const validation = await p.validateApiKey(apiKey);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'invalid_api_key' });
      }

      // Create connection immediately
      const connection = await IntegrationConnection.findOneAndUpdate(
        { tenantId: (req as any).currentUser.tenantId, provider: p.name },
        {
          accessToken: apiKey, // Store API key as accessToken (encrypted automatically by model)
          profile: validation.profile,
          status: 'active',
          updatedAt: new Date(),
        },
        { upsert: true, new: true },
      );

      // Trigger sync
      await scheduleIntegrationSync(connection._id.toString());

      return res.json({ success: true, connection });
    } catch (err) {
      console.error('API Key validation error', err);
      return res.status(500).json({ error: 'validation_failed' });
    }
  }

  return res.status(400).json({ error: 'unknown_auth_type' });
});

// Handle OAuth callback
router.post('/:provider/callback', requireAuth, requireAdmin, async (req, res) => {
  const { provider } = req.params;
  const { code } = req.body;
  const ctx = (req as any).currentUser;

  const p = integrationRegistry.get(provider as string);
  if (!p) return res.status(404).json({ error: 'provider_not_found' });

  try {
    const tokenData = await p.exchangeCode(code);

    // Create or update connection
    const connection = await IntegrationConnection.findOneAndUpdate(
      { tenantId: ctx.tenantId, provider: p.name },
      {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        profile: tokenData.profile,
        status: 'active',
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // Trigger initial sync via queue
    await scheduleIntegrationSync(connection._id.toString());

    res.json({ success: true, connection });
  } catch (err) {
    console.error('OAuth callback error', err);
    res.status(500).json({ error: 'oauth_failed' });
  }
});

// Trigger manual sync
router.post('/:connectionId/sync', requireAuth, requireAdmin, async (req, res) => {
  const { connectionId } = req.params;
  const ctx = (req as any).currentUser;

  const connection = await IntegrationConnection.findOne({
    _id: connectionId,
    tenantId: ctx.tenantId,
  });
  if (!connection) return res.status(404).json({ error: 'connection_not_found' });

  // Trigger sync via queue
  await scheduleIntegrationSync(connection._id.toString());

  res.json({ success: true, message: 'Sync started' });
});

// Disconnect
router.delete('/:connectionId', requireAuth, requireAdmin, async (req, res) => {
  const { connectionId } = req.params;
  const ctx = (req as any).currentUser;

  await IntegrationConnection.deleteOne({ _id: connectionId, tenantId: ctx.tenantId });
  await SyncedObject.deleteMany({ integrationConnectionId: connectionId, tenantId: ctx.tenantId });

  res.json({ success: true });
});

export default router;
