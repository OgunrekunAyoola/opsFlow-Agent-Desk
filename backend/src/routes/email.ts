import { Router } from 'express';
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

export default router;
