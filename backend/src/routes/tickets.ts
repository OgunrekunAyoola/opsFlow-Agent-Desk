import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import Ticket from '../models/Ticket';
import Client from '../models/Client';
import TicketReply from '../models/TicketReply';
import User from '../models/User';
import Notification from '../models/Notification';
import { EmailService } from '../services/EmailService';
import { emailSendQueue, resolvedSnippetQueue } from '../queue/index';
import UserAction from '../models/UserAction';
import Tenant from '../models/Tenant';
import { ResolvedTicketEmbeddingService } from '../services/ResolvedTicketEmbeddingService';
import AiCorrection from '../models/AiCorrection';

const router = Router();
const frontendBaseUrl = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(
  /\/+$/,
  '',
);

function computeEditRatio(a: string, b: string): number {
  if (!a || !b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  const minLen = Math.min(a.length, b.length);
  let same = 0;
  for (let i = 0; i < minLen; i += 1) {
    if (a[i] === b[i]) same += 1;
  }
  return 1 - same / maxLen;
}

// List tickets
router.get('/', requireAuth, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const {
    status,
    priority,
    assigneeId,
    search,
    page: pageStr,
    pageSize: pageSizeStr,
  } = req.query as any;

  const query: any = { tenantId };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assigneeId === 'unassigned') {
    query.assigneeId = null;
  } else if (assigneeId === 'me') {
    query.assigneeId = userId;
  } else if (assigneeId) {
    query.assigneeId = assigneeId;
  }
  if (search && typeof search === 'string' && search.trim().length > 0) {
    const s = search.trim();
    query.$or = [
      { subject: { $regex: s, $options: 'i' } },
      { body: { $regex: s, $options: 'i' } },
      { customerEmail: { $regex: s, $options: 'i' } },
      { customerName: { $regex: s, $options: 'i' } },
    ];
  }

  const page = Math.max(parseInt(pageStr || '1', 10), 1);
  const pageSize = Math.max(Math.min(parseInt(pageSizeStr || '20', 10), 100), 1);
  const total = await Ticket.countDocuments(query).exec();
  const tickets = await Ticket.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate('assigneeId', 'name email')
    .populate('clientId', 'name domain')
    .exec();

  res.json({ items: tickets, page, pageSize, total });
});

// Create ticket
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

router.post('/', requireAuth, validate(createTicketSchema), async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser || {};
  if (!tenantId) {
    return res.status(500).json({ error: 'missing_tenant_in_context' });
  }
  const { subject, body, customerName, customerEmail, priority, category, clientId } = req.body;

  // Optional client validation
  let clientRef: any = undefined;
  if (clientId) {
    const client = await Client.findOne({ _id: clientId, tenantId }).exec();
    if (!client) {
      return res.status(400).json({ error: 'Invalid clientId for this tenant' });
    }
    clientRef = client._id;
  }

  const ticket = await Ticket.create({
    tenantId,
    clientId: clientRef,
    createdById: userId,
    subject,
    body,
    channel: 'web_form', // Default for internal creation
    customerName,
    customerEmail,
    assigneeId: null,
    priority: priority || 'medium',
    category: category || 'general',
    status: 'new',
  });

  const populated = await Ticket.findById(ticket._id)
    .populate('assigneeId', 'name email')
    .populate('createdById', 'name email')
    .populate('clientId', 'name domain')
    .exec();

  if (ticket.priority === 'high' || ticket.priority === 'urgent') {
    try {
      const admins = await User.find({ tenantId, role: 'admin' }).select('_id').exec();
      if (admins.length > 0) {
        const shortId = ticket._id.toString().slice(-6);
        const message = `High priority ticket #${shortId} created: ${ticket.subject}`;
        const url = `/tickets/${ticket._id.toString()}`;
        await Notification.insertMany(
          admins.map((admin) => ({
            tenantId,
            userId: admin._id,
            type: 'high_priority_ticket',
            message,
            url,
          })),
        );
      }
    } catch {}
  }

  res.status(201).json(populated);
});

router.post('/ingest/email', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { subject, body, from, to, messageId } = req.body || {};
  if (!subject || !body || !from) {
    return res.status(400).json({ error: 'subject, body, from required' });
  }
  if (messageId) {
    const exists = await Ticket.findOne({ tenantId, messageId }).exec();
    if (exists) {
      return res.json({ ticket: exists });
    }
  }
  const ticket = await Ticket.create({
    tenantId,
    subject,
    body,
    messageId,
    channel: 'email',
    customerEmail: from,
    assigneeId: null,
    status: 'new',
    priority: 'medium',
    category: 'general',
  });
  const populated = await Ticket.findById(ticket._id).populate('clientId', 'name domain').exec();
  res.status(201).json({ ticket: populated });
});

router.post('/ingest', async (req, res) => {
  try {
    const { subject, body, customerName, customerEmail, externalId, channel } = req.body || {};
    const apiKey = (req.headers['x-opsflow-key'] as string) || (req.query?.apiKey as string) || '';

    if (!apiKey) {
      return res.status(401).json({ error: 'missing_api_key' });
    }

    if (!subject || !body) {
      return res.status(400).json({ error: 'subject_and_body_required' });
    }

    const tenant = await Tenant.findOne({ ingestApiKey: apiKey }).exec();
    if (!tenant) {
      return res.status(401).json({ error: 'invalid_api_key' });
    }

    const ticketChannel = channel === 'chat' ? 'web_form' : 'email';

    if (externalId) {
      const existing = await Ticket.findOne({
        tenantId: tenant._id,
        messageId: externalId,
      }).exec();
      if (existing) {
        return res.json({ ticket: existing });
      }
    }

    const ticket = await Ticket.create({
      tenantId: tenant._id,
      subject,
      body,
      messageId: externalId,
      channel: ticketChannel,
      customerName,
      customerEmail,
      status: 'new',
      priority: 'medium',
      category: 'general',
    });

    const populated = await Ticket.findById(ticket._id).populate('clientId', 'name domain').exec();

    res.status(201).json({ ticket: populated });
  } catch {
    res.status(500).json({ error: 'failed_to_ingest_ticket' });
  }
});
// Get ticket details
router.get('/:id', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { id } = req.params;

  const ticket = await Ticket.findOne({ _id: id, tenantId })
    .populate('assigneeId', 'name email')
    .populate('createdById', 'name email')
    .exec();

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const replies = await TicketReply.find({ ticketId: id, tenantId })
    .populate('authorId', 'name email')
    .sort({ createdAt: 1 })
    .exec();

  res.json({ ...ticket.toJSON(), replies });
});

// Add reply
router.post('/:id/reply', requireAuth, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { id } = req.params;
  const { body, useAiDraft } = req.body;

  if (!body) {
    return res.status(400).json({ error: 'Body is required' });
  }

  const ticket = await Ticket.findOne({ _id: id, tenantId });
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const reply = await TicketReply.create({
    tenantId,
    ticketId: id,
    authorType: 'human',
    authorId: userId,
    body,
  });

  // Auto-update status to replied if it was new/triaged/awaiting_reply
  if (['new', 'triaged', 'awaiting_reply'].includes(ticket.status)) {
    ticket.status = 'replied';
    await ticket.save();
  }

  if (ticket.customerEmail) {
    reply.deliveryStatus = 'queued';
    await reply.save();
    await emailSendQueue.add('send', {
      replyId: reply._id.toString(),
      to: ticket.customerEmail,
      subject: `Re: ${ticket.subject}`,
      body,
    });
  }

  await reply.populate('authorId', 'name email');
  try {
    await UserAction.create({
      tenantId,
      userId,
      type: 'ticket_reply',
      subjectId: reply._id,
      meta: { ticketId: id, useAiDraft: !!useAiDraft },
    });
    if (useAiDraft) {
      await UserAction.create({
        tenantId,
        userId,
        type: 'ai_suggestion_used',
        subjectId: reply._id,
        meta: { ticketId: id },
      });

      try {
        const originalQuestion = `${ticket.subject || ''}\n\n${ticket.body || ''}`.trim();
        const aiSuggestion = ticket.aiDraft?.body || ticket.aiAnalysis?.suggestedReply || '';
        const finalHumanAnswer = body;
        if (originalQuestion && aiSuggestion && finalHumanAnswer) {
          const editRatio = computeEditRatio(aiSuggestion, finalHumanAnswer);
          await AiCorrection.create({
            tenantId,
            ticketId: ticket._id,
            originalQuestion,
            aiSuggestion,
            finalHumanAnswer,
            intent: ticket.category,
            tags: [],
            editRatio,
          });
        }
      } catch {}
    }
  } catch {}

  try {
    await resolvedSnippetQueue.add('upsert', {
      tenantId: tenantId.toString(),
      ticketId: ticket._id.toString(),
    });
  } catch {}

  res.status(201).json(reply);
});

// Update ticket (status, priority, assignee)
router.patch('/:id', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { id } = req.params;
  const updates = req.body;

  const allowedUpdates = ['status', 'priority', 'category', 'assigneeId'];
  const safeUpdates: any = {};

  Object.keys(updates).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      safeUpdates[key] = updates[key];
    }
  });

  const existing = await Ticket.findOne({ _id: id, tenantId }).exec();
  if (!existing) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const previousAssigneeId = existing.assigneeId ? existing.assigneeId.toString() : null;

  Object.assign(existing, safeUpdates);
  const ticket = await existing.save();
  await ticket.populate('assigneeId', 'name email');

  const currentAssignee: any = ticket.assigneeId;
  const newAssigneeId =
    currentAssignee && currentAssignee._id
      ? currentAssignee._id.toString()
      : currentAssignee
        ? currentAssignee.toString()
        : null;

  if (previousAssigneeId !== newAssigneeId && newAssigneeId) {
    try {
      const email = currentAssignee?.email;
      const name = currentAssignee?.name || 'there';

      if (email) {
        const emailService = new EmailService();
        const shortId = ticket._id.toString().slice(-6);
        const subject = `You've been assigned ticket #${shortId}`;
        const ticketUrl = `${frontendBaseUrl}/tickets/${ticket._id.toString()}`;
        const text = `Hi ${name},\n\nYou've been assigned ticket #${shortId}.\n\nSubject: ${ticket.subject}\n\nView the ticket: ${ticketUrl}\n`;
        const html = `<p>Hi ${name},</p><p>You've been assigned ticket #${shortId}.</p><p><strong>Subject:</strong> ${ticket.subject}</p><p><a href="${ticketUrl}">View ticket in OpsFlow</a></p>`;
        await emailService.send({ to: email, subject, text, html });
      }

      const shortId = ticket._id.toString().slice(-6);
      const message = `You were assigned ticket #${shortId}: ${ticket.subject}`;
      const url = `/tickets/${ticket._id.toString()}`;
      await Notification.create({
        tenantId,
        userId: newAssigneeId,
        type: 'ticket_assigned',
        message,
        url,
      });
    } catch (err) {
      console.error('Failed to send assignment email', err);
    }
  }

  // Level 4 Trigger: If ticket is closed, trigger embedding update
  if (['closed', 'resolved'].includes(ticket.status)) {
    try {
      await resolvedSnippetQueue.add('upsert', {
        tenantId: tenantId.toString(),
        ticketId: ticket._id.toString(),
      });
    } catch (e) {
      console.error('Failed to queue embedding upsert', e);
    }
  }

  res.json(ticket);
});

import { TicketTriageWorkflow } from '../services/TicketTriageWorkflow';
import WorkflowRun from '../models/WorkflowRun';
import WorkflowStep from '../models/WorkflowStep';
import LlmCallLog from '../models/LlmCallLog';

// ... existing imports

// Get ticket workflows history
router.get('/:id/workflows', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { id } = req.params;

  const runs = await WorkflowRun.find({ ticketId: id, tenantId }).sort({ startedAt: -1 }).exec();

  const runsWithSteps = await Promise.all(
    runs.map(async (run) => {
      const steps = await WorkflowStep.find({ workflowRunId: run._id, tenantId })
        .sort({ createdAt: 1 })
        .exec();
      return { ...run.toJSON(), steps };
    }),
  );

  res.json(runsWithSteps);
});

// List high-risk AI replies for review
router.get('/ai/review', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { limit: limitStr } = req.query as any;
  const limit = Math.max(Math.min(parseInt(limitStr || '50', 10) || 50, 100), 1);

  const riskyTickets = await Ticket.find({
    tenantId,
    'aiAnalysis.risk': 'high',
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select(
      '_id subject aiAnalysis.createdAt aiAnalysis.risk aiAnalysis.faithfulness aiAnalysis.completeness',
    )
    .lean()
    .exec();

  const heavyCorrections = await AiCorrection.find({
    tenantId,
    editRatio: { $gte: 0.4 },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();

  const heavyTicketIds = Array.from(new Set(heavyCorrections.map((c) => c.ticketId.toString())));

  let heavyTickets: any[] = [];
  if (heavyTicketIds.length > 0) {
    heavyTickets = await Ticket.find({
      tenantId,
      _id: { $in: heavyTicketIds },
    })
      .select(
        '_id subject aiAnalysis.createdAt aiAnalysis.risk aiAnalysis.faithfulness aiAnalysis.completeness',
      )
      .lean()
      .exec();
  }

  const combinedMap = new Map<string, any>();
  riskyTickets.forEach((t) => {
    combinedMap.set(t._id.toString(), t);
  });
  heavyTickets.forEach((t) => {
    const id = t._id.toString();
    if (!combinedMap.has(id)) {
      combinedMap.set(id, t);
    }
  });

  const combined = Array.from(combinedMap.values()).sort((a, b) => {
    const aTime =
      (a.aiAnalysis && a.aiAnalysis.createdAt
        ? new Date(a.aiAnalysis.createdAt).getTime()
        : new Date(a.updatedAt || 0).getTime()) || 0;
    const bTime =
      (b.aiAnalysis && b.aiAnalysis.createdAt
        ? new Date(b.aiAnalysis.createdAt).getTime()
        : new Date(b.updatedAt || 0).getTime()) || 0;
    return bTime - aTime;
  });

  res.json(combined.slice(0, limit));
});

// Basic AI usage metrics for this tenant
router.get('/ai/metrics', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { since } = req.query as any;

  const match: any = { tenantId };
  if (since) {
    const sinceDate = new Date(since);
    if (!isNaN(sinceDate.getTime())) {
      match.createdAt = { $gte: sinceDate };
    }
  }

  const agg = await LlmCallLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$task',
        totalCalls: { $sum: 1 },
        successes: { $sum: { $cond: ['$success', 1, 0] } },
        failures: { $sum: { $cond: ['$success', 0, 1] } },
        avgLatencyMs: { $avg: '$latencyMs' },
      },
    },
  ]);

  res.json(agg);
});

// Simple in-memory rate limiter for AI-heavy endpoints
const aiRateBuckets = new Map<string, { count: number; windowStart: number }>();
const AI_WINDOW_MS = 60_000;
const AI_MAX_CALLS_PER_WINDOW = 20;

function checkAiRateLimit(tenantId: string): boolean {
  const now = Date.now();
  const key = tenantId || 'unknown';
  const bucket = aiRateBuckets.get(key);
  if (!bucket || now - bucket.windowStart > AI_WINDOW_MS) {
    aiRateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (bucket.count >= AI_MAX_CALLS_PER_WINDOW) {
    return false;
  }
  bucket.count += 1;
  return true;
}

// Run AI Triage Workflow
router.post('/:id/workflows/triage', requireAuth, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { id } = req.params;

  if (!checkAiRateLimit(String(tenantId))) {
    return res.status(429).json({ error: 'ai_rate_limited' });
  }

  const workflow = new TicketTriageWorkflow();
  try {
    const result = await workflow.run({
      tenantId,
      ticketId: id as string,
      startedByUserId: userId,
    });
    res.json(result);
  } catch (err: any) {
    console.error('Workflow failed:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
