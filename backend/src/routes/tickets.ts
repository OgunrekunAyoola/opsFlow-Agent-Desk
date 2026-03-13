import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { TicketService } from '../services/TicketService';

const router = Router();
const ticketService = new TicketService();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { tenantId, userId } = (req as any).currentUser;
    const result = await ticketService.listTickets({ tenantId, userId, params: req.query });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    customerName: z.string().optional(),
    customerEmail: z.string().email('Invalid email').optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    category: z.string().optional(),
    clientId: z.string().optional(),
  }),
});

router.post('/', requireAuth, validate(createTicketSchema), async (req, res, next) => {
  try {
    const { tenantId, userId } = (req as any).currentUser || {};
    if (!tenantId) return res.status(500).json({ error: 'missing_tenant_in_context' });
    const ticket = await ticketService.createTicket({ tenantId, userId, data: req.body });
    res.status(201).json(ticket);
  } catch (err: any) {
    if (err.message === 'Invalid clientId for this tenant') return res.status(400).json({ error: err.message });
    next(err);
  }
});

router.post('/ingest/email', requireAuth, async (req, res, next) => {
  try {
    const { tenantId } = (req as any).currentUser;
    const result = await ticketService.ingestEmail({ tenantId, data: req.body });
    res.status(201).json({ ticket: result });
  } catch (err: any) {
    if (err.message === 'subject, body, from required') return res.status(400).json({ error: err.message });
    next(err);
  }
});

router.post('/ingest', async (req, res) => {
  try {
    const apiKey = (req.headers['x-opsflow-key'] as string) || (req.query?.apiKey as string) || '';
    if (!apiKey) return res.status(401).json({ error: 'missing_api_key' });
    const result = await ticketService.ingestApi({ apiKey, data: req.body });
    res.status(201).json({ ticket: result });
  } catch (err: any) {
    if (err.message === 'subject_and_body_required') return res.status(400).json({ error: err.message });
    if (err.message === 'invalid_api_key') return res.status(401).json({ error: err.message });
    res.status(500).json({ error: 'failed_to_ingest_ticket' });
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { tenantId } = (req as any).currentUser;
    const result = await ticketService.getTicketDetails(tenantId, req.params.id as string);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'Ticket not found') return res.status(404).json({ error: err.message });
    next(err);
  }
});

router.post('/:id/reply', requireAuth, async (req, res, next) => {
  try {
    const { tenantId, userId } = (req as any).currentUser;
    const result = await ticketService.addReply({ tenantId, userId, ticketId: req.params.id as string, data: req.body });
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message === 'Body is required') return res.status(400).json({ error: err.message });
    if (err.message === 'Ticket not found') return res.status(404).json({ error: err.message });
    next(err);
  }
});

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const { tenantId } = (req as any).currentUser;
    const result = await ticketService.updateTicket(tenantId, req.params.id as string, req.body);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'Ticket not found') return res.status(404).json({ error: err.message });
    next(err);
  }
});

router.get('/:id/workflows', requireAuth, async (req, res, next) => {
  try {
    const { tenantId } = (req as any).currentUser;
    const result = await ticketService.getWorkflows(tenantId, req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/ai/review', requireAuth, async (req, res, next) => {
  try {
    const { tenantId } = (req as any).currentUser;
    const result = await ticketService.getAiReviewTickets(tenantId, req.query.limit as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/ai/metrics', requireAuth, async (req, res, next) => {
  try {
    const { tenantId } = (req as any).currentUser;
    const result = await ticketService.getAiMetrics(tenantId, req.query.since as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/workflows/triage', requireAuth, async (req, res, next) => {
  try {
    const { tenantId, userId } = (req as any).currentUser;
    const result = await ticketService.runTriageWorkflow(tenantId, req.params.id as string, userId);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'ai_rate_limited') return res.status(429).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

export default router;
