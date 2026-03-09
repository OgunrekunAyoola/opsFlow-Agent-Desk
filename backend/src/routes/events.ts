import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import EventLog from '../models/EventLog';
import Ticket from '../models/Ticket';
import Notification from '../models/Notification';
import User from '../models/User';
import Tenant from '../models/Tenant';
import { requireAuth } from '../middleware/auth';

const router = Router();

const ingestEventSchema = z.object({
  body: z.object({
    source: z.string().min(1),
    eventType: z.string().min(1),
    severity: z.enum(['info', 'warning', 'critical']).optional(),
    payload: z.any(),
    timestamp: z.string().optional(),
  }),
});

router.post('/ingest', async (req, res) => {
  const apiKey = (req.headers['x-opsflow-key'] as string) || (req.query?.apiKey as string);

  if (!apiKey) {
    return res.status(401).json({ error: 'missing_api_key' });
  }

  const tenant = await Tenant.findOne({ ingestApiKey: apiKey }).exec();
  if (!tenant) {
    return res.status(401).json({ error: 'invalid_api_key' });
  }

  const { source, eventType, severity = 'info', payload } = req.body;

  try {
    console.log('Ingesting event:', { source, eventType, severity, tenantId: tenant._id });
    // 1. Log the event
    const event = await EventLog.create({
      tenantId: tenant._id,
      source,
      eventType,
      severity,
      payload,
      status: 'processed',
    });
    console.log('EventLog created:', event._id);

    // 2. Anomaly Detection / Proactive Trigger
    let ticketId: any = null;
    if (severity === 'critical') {
      console.log('Critical event detected, checking for existing ticket...');
      const existingTicket = await Ticket.findOne({
        tenantId: tenant._id,
        status: { $in: ['new', 'open', 'in_progress'] },
        'meta.eventSource': source,
        'meta.eventType': eventType,
      });

      if (!existingTicket) {
        console.log('Creating new proactive ticket...');
        const ticket = await Ticket.create({
          tenantId: tenant._id,
          subject: `[System Alert] ${source}: ${eventType}`,
          body: `Critical system event detected.\n\nPayload:\n${JSON.stringify(payload, null, 2)}`,
          status: 'new',
          priority: 'urgent',
          channel: 'integration', // Set channel
          category: 'other',
          customerEmail: 'system-alert@opsflow.ai', // Required field
          meta: {
            eventSource: source,
            eventType: eventType,
            eventId: event._id,
          },
        });
        ticketId = ticket._id;
        console.log('Ticket created:', ticketId);

        // Link event to ticket
        event.relatedTicketId = ticket._id as any;
        await event.save();

        // Notify Admins
        const admins = await User.find({ tenantId: tenant._id, role: 'admin' });
        if (admins.length > 0) {
          // ...
        }
      } else {
        console.log('Using existing ticket:', existingTicket._id);
        ticketId = existingTicket._id;
      }
    }

    res.json({ success: true, eventId: event._id, ticketId });
  } catch (err: any) {
    console.error('Event ingestion failed detailed:', err);
    res.status(500).json({ error: 'internal_error', details: err.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const events = await EventLog.find({ tenantId }).sort({ createdAt: -1 }).limit(50).exec();
  res.json({ items: events });
});

export default router;
