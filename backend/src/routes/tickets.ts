import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import Ticket from '../models/Ticket';
import Client from '../models/Client';
import TicketReply from '../models/TicketReply';
import User from '../models/User';
import Notification from '../models/Notification';
import { EmailService } from '../services/EmailService';
import { emailSendQueue } from '../queue/index';
import UserAction from '../models/UserAction';

const router = Router();
const frontendBaseUrl = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(
  /\/+$/,
  '',
);

// List tickets
router.get('/', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
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
router.post('/', requireAuth, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { subject, body, customerName, customerEmail, priority, category, clientId } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and body are required' });
  }

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
  const { body } = req.body;

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
      meta: { ticketId: id },
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

  res.json(ticket);
});

import { TicketTriageWorkflow } from '../services/TicketTriageWorkflow';
import WorkflowRun from '../models/WorkflowRun';
import WorkflowStep from '../models/WorkflowStep';

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

// Run AI Triage Workflow
router.post('/:id/workflows/triage', requireAuth, async (req, res) => {
  const { tenantId, userId } = (req as any).currentUser;
  const { id } = req.params;

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
