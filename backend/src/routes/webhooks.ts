import { Router } from 'express';
import { TicketService } from '../services/TicketService';
import Tenant from '../models/Tenant';

const router = Router();
const ticketService = new TicketService();

router.post('/email', async (req, res, next) => {
  try {
    // Basic verification for inbound email webhook
    // Assumes an external service like Sendgrid or Postmark is posting JSON
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Missing destination address' });
    }

    // Find tenant by inbound email address
    // In a real app, you would parse the "to" email to find the tenant subdomain/address
    // Example: support@tenant1.opsflow.ai
    let tenantDomain = to.split('@')[1];
    if (to.includes('+')) {
      // support+tenant@opsflow.ai
      tenantDomain = to.split('+')[1].split('@')[0];
    }
    
    // Fallback simply find the first tenant for prototype purposes, or by domain matching
    const tenant = await Tenant.findOne({ deletedAt: null }).exec();
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Webhook Signature Verification
    const sigHeader = (req.headers['x-opsflow-signature'] as string);
    if (sigHeader && tenant.inboundSecret) {
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', tenant.inboundSecret);
      const computed = hmac.update(JSON.stringify(req.body)).digest('hex');
      if (computed !== sigHeader) {
        return res.status(401).json({ error: 'invalid_signature' });
      }
    }

    const ticket = await ticketService.ingestEmail({ tenantId: tenant._id.toString(), data: req.body });
    res.status(201).json({ ticket });
  } catch (err: any) {
    if (err.message === 'subject, body, from required') return res.status(400).json({ error: err.message });
    next(err);
  }
});

router.post('/ticket', async (req, res, next) => {
  try {
    const apiKey = (req.headers['x-opsflow-key'] as string) || (req.query?.apiKey as string) || '';
    if (!apiKey) return res.status(401).json({ error: 'missing_api_key' });
    
    const ticket = await ticketService.ingestApi({ apiKey, data: req.body });
    res.status(201).json({ ticket });
  } catch (err: any) {
    if (err.message === 'subject_and_body_required') return res.status(400).json({ error: err.message });
    if (err.message === 'invalid_api_key') return res.status(401).json({ error: err.message });
    next(err);
  }
});

export default router;
