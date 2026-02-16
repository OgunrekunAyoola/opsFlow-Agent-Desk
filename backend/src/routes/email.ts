import { Router } from 'express';
import crypto from 'crypto';
import Tenant from '../models/Tenant';
import Ticket from '../models/Ticket';
import Client from '../models/Client';

const router = Router();

function extractDomain(email: string | undefined) {
  if (!email) return undefined;
  const at = email.lastIndexOf('@');
  if (at === -1) return undefined;
  return email.slice(at + 1).toLowerCase();
}

// Provider webhook: create or dedupe tickets by messageId
router.post('/inbound', async (req, res) => {
  const { to, from, subject, text, html, messageId } = req.body || {};
  const secret = (req.headers['x-inbound-secret'] as string) || (req.query?.secret as string);

  if (!subject || !(text || html) || !from) {
    return res.status(400).json({ error: 'Missing subject/body/from' });
  }

  let tenant;
  if (secret) {
    tenant = await Tenant.findOne({ inboundSecret: secret }).exec();
  } else if (to) {
    tenant = await Tenant.findOne({ inboundAddress: to }).exec();
  }
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found for inbound webhook' });
  }

  // Optional signature verification when header provided
  const sigHeader =
    (req.headers['x-signature'] as string) || (req.headers['resend-signature'] as string);
  if (sigHeader) {
    try {
      if (!tenant.inboundSecret)
        return res.status(401).json({ error: 'No tenant secret configured' });
      const raw = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const h = crypto
        .createHmac('sha256', tenant.inboundSecret as string)
        .update(raw)
        .digest('hex');
      if (h !== sigHeader) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  }

  if (messageId) {
    const existing = await Ticket.findOne({ tenantId: tenant._id, messageId }).exec();
    if (existing) {
      return res.json({ ticket: existing });
    }
  }

  const domain = extractDomain(from);
  let clientId: any = undefined;
  if (domain) {
    const client = await Client.findOne({ tenantId: tenant._id, domain }).exec();
    if (client) clientId = client._id;
  }

  tenant.lastInboundAt = new Date();
  await tenant.save();

  const ticket = await Ticket.create({
    tenantId: tenant._id,
    clientId,
    subject,
    body: (text as string) || (html as string),
    channel: 'email',
    messageId,
    customerEmail: from,
    status: 'new',
    priority: 'medium',
    category: 'general',
  });

  const populated = await Ticket.findById(ticket._id).populate('clientId', 'name domain').exec();
  res.status(201).json({ ticket: populated });
});

// Provider delivery events (e.g., Resend)
router.post('/events', async (req, res) => {
  const secret = (req.headers['x-inbound-secret'] as string) || (req.query?.secret as string);
  const tenant = secret ? await Tenant.findOne({ inboundSecret: secret }).exec() : null;
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  const sigHeader =
    (req.headers['x-signature'] as string) || (req.headers['resend-signature'] as string);
  if (sigHeader) {
    try {
      if (!tenant.inboundSecret)
        return res.status(401).json({ error: 'No tenant secret configured' });
      const raw = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const h = crypto
        .createHmac('sha256', tenant.inboundSecret as string)
        .update(raw)
        .digest('hex');
      if (h !== sigHeader) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  }

  const type: string = req.body?.type || req.body?.event || '';
  const candidateId: string | undefined =
    req.body?.data?.id || req.body?.id || req.body?.object?.id || req.body?.messageId;

  if (!candidateId) {
    return res.status(400).json({ error: 'Missing provider message id' });
  }

  // Map provider events to deliveryStatus
  const statusMap: Record<string, string> = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
  };

  const desired = statusMap[type] || 'sent';
  const TicketReply = (await import('../models/TicketReply')).default;
  const reply = await TicketReply.findOne({
    tenantId: tenant._id,
    deliveryProvider: 'resend',
    providerMessageId: candidateId,
  }).exec();
  if (!reply) {
    return res.status(404).json({ error: 'Reply not found for event' });
  }
  reply.deliveryStatus = desired as any;
  if (desired === 'delivered') reply.deliveredAt = new Date();
  await reply.save();
  res.json({ ok: true });
});

export default router;
