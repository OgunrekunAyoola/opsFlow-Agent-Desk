import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';
import { TicketService } from '../services/TicketService';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { tenantScope } from '../shared/utils/tenantGuard';
import logger from '../shared/utils/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
});

// Middleware to verify portal token
const verifyPortalToken = (req: any, res: any, next: any) => {
  const token = req.params.token;
  if (!token) {
    return res.status(401).json({ error: 'missing_token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.portalInfo = decoded; // { ticketId, customerEmail, tenantId }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
};

router.get('/:token', verifyPortalToken, async (req, res) => {
  try {
    const { ticketId, tenantId } = (req as any).portalInfo;

    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) })
      .select('subject status createdAt priority customerEmail')
      .exec();

    if (!ticket) {
      return res.status(404).json({ error: 'ticket_not_found' });
    }

    // Get public replies only
    const replies = await TicketReply.find({
      ticketId,
      ...tenantScope(tenantId),
      isInternalNote: { $ne: true },
      type: { $ne: 'internal_note' }
    })
      .sort({ createdAt: 1 })
      .select('body createdAt authorType authorName type')
      .exec();

    res.json({
      ticket,
      replies,
    });
  } catch (error) {
    logger.error('Failed to get portal ticket:', error);
    res.status(500).json({ error: 'internal_error' });
  }
});

router.post('/:token/reply', verifyPortalToken, async (req, res) => {
  try {
    await rateLimiter.consume(req.ip || 'unknown');

    const { ticketId, tenantId } = (req as any).portalInfo;
    const { body } = req.body;

    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ error: 'missing_body' });
    }

    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) }).exec();
    if (!ticket) {
      return res.status(404).json({ error: 'ticket_not_found' });
    }

    // Reuse edge case logic to process human reply + state transitions
    const ticketService = new TicketService();
    await ticketService.handleInboundReply(tenantId, ticket, ticket.customerEmail || 'portal_user', body);

    res.json({ ok: true });
  } catch (error: any) {
    if (error.name === 'Error' || error.consumedPoints) {
      return res.status(429).json({ error: 'rate_limited' });
    }
    logger.error('Failed to add portal reply:', error);
    res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
