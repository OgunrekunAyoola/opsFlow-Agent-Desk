import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Ticket from '../models/Ticket';
import Client from '../models/Client';
import TicketReply from '../models/TicketReply';
import User from '../models/User';
import Notification from '../models/Notification';
import { NotificationService } from './NotificationService';
import { emailSendQueue, resolvedSnippetQueue, ticketOrchestrationQueue, shouldUseMock } from '../queue';
import { TicketOrchestrator } from '../core/orchestrator/TicketOrchestrator';
import UserAction from '../models/UserAction';
import Tenant from '../models/Tenant';
import AiCorrection from '../models/AiCorrection';
import SLAPolicy from '../models/SLAPolicy';
import WorkflowRun from '../models/WorkflowRun';
import WorkflowStep from '../models/WorkflowStep';
import LlmCallLog from '../models/LlmCallLog';
import { SLAService } from './SLAService';
import { AssignmentService } from './AssignmentService';
import { tenantScope } from '../shared/utils/tenantGuard';
import logger from '../shared/utils/logger';

const frontendBaseUrl = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const aiRateBuckets = new Map<string, { count: number; windowStart: number }>();
const AI_WINDOW_MS = 60_000;
const AI_MAX_CALLS_PER_WINDOW = 20;

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

export class TicketService {
  private slaService: SLAService;

  constructor() {
    this.slaService = new SLAService();
  }

  async listTickets({ tenantId, userId, params }: { tenantId: string; userId: string; params: any }) {
    const { status, priority, assigneeId, search, page: pageStr, pageSize: pageSizeStr } = params;
    const query: any = { ...tenantScope(tenantId) };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigneeId === 'unassigned') query.assigneeId = null;
    else if (assigneeId === 'me') query.assigneeId = userId;
    else if (assigneeId) query.assigneeId = assigneeId;

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

    return { items: tickets, page, pageSize, total };
  }

  async createTicket({ tenantId, userId, data }: { tenantId: string; userId: string; data: any }) {
    const { subject, body, customerName, customerEmail, priority, category, clientId } = data;
    let clientRef: any = undefined;
    if (clientId) {
      const client = await Client.findOne({ _id: clientId, ...tenantScope(tenantId) }).exec();
      if (!client) throw new Error('Invalid clientId for this tenant');
      clientRef = client._id;
    }

    const ticket = await Ticket.create({
      tenantId,
      clientId: clientRef,
      createdById: userId,
      subject,
      body,
      channel: 'web_form',
      customerName,
      customerEmail,
      assigneeId: null,
      priority: priority || 'medium',
      category: category || 'general',
      status: 'new',
    });

    // Task 3.4: Ticket Acknowledgement Email
    if (customerEmail) {
      this.sendAcknowledgementEmail(tenantId, ticket);
    }


    const populated = await Ticket.findOne({ _id: ticket._id, ...tenantScope(tenantId) })
      .populate('assigneeId', 'name email')
      .populate('createdById', 'name email')
      .populate('clientId', 'name domain')
      .exec();

    if (ticket.priority === 'high' || ticket.priority === 'urgent') {
      try {
        const admins = await User.find({ ...tenantScope(tenantId), role: 'admin' }).select('_id').exec();
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

    return populated;
  }

  async ingestEmail({ tenantId, data }: { tenantId: string; data: any }) {
    const { subject, body, from, messageId } = data;
    if (!subject || !body || !from) throw new Error('subject, body, from required');

    if (messageId) {
      const exists = await Ticket.findOne({ ...tenantScope(tenantId), messageId }).exec();
      if (exists) return exists;
    }

    // Task 3.3: Detect if reply to existing ticket
    if (subject.toLowerCase().startsWith('re:')) {
      const cleanSubject = subject.replace(/^[Rr][Ee]:\s*/i, '').trim();
      // Try to find by subject and email
      const existingTicket = await Ticket.findOne({
        ...tenantScope(tenantId),
        customerEmail: from,
        subject: { $regex: new RegExp(cleanSubject, 'i') }
      }).exec();

      if (existingTicket) {
        await this.handleInboundReply(tenantId, existingTicket, from, body);
        return existingTicket;
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
    const populated = await Ticket.findOne({ _id: ticket._id, ...tenantScope(tenantId) }).populate('clientId', 'name domain').exec();

    // Task 3.4: Acknowledgement
    this.sendAcknowledgementEmail(tenantId, ticket);

    this.triggerAutoTriage(tenantId, ticket._id.toString());
    return populated;
  }

  async handleInboundReply(tenantId: string, ticket: any, from: string, body: string) {
    // 1. Add Reply
    const reply = await TicketReply.create({
      tenantId,
      ticketId: ticket._id,
      authorType: 'human',
      body,
      type: 'public_reply',
    });

    // 2. Task 3.3: Reopen Logic & Status Update
    const oldStatus = ticket.status;
    if (['closed', 'auto_resolved', 'waiting_on_customer'].includes(oldStatus)) {
      ticket.status = 'open'; // Auto-set back to 'open' when customer replies
      await ticket.save();

      // 3. Resume SLA Clock
      await this.slaService.resumeSLAClock(tenantId, ticket._id.toString());

      // 4. Re-run Triage only if it was closed (to categorize potentially new issue info)
      if (oldStatus === 'closed') {
        this.triggerAutoTriage(tenantId, ticket._id.toString());
      }

      // 5. Notify previously assigned agent
      if (ticket.assigneeId) {
        await Notification.create({
          tenantId,
          userId: ticket.assigneeId,
          type: 'ticket_reopened',
          message: `Ticket #${ticket._id.toString().slice(-6)} reopened by customer reply.`,
          url: `/tickets/${ticket._id}`,
        });
      }
    } else {
      // Just resume SLA Clock if it was paused
      await this.slaService.resumeSLAClock(tenantId, ticket._id.toString());
    }

    return reply;
  }

  async ingestApi({ apiKey, data }: { apiKey: string; data: any }) {
    const { subject, body, customerName, customerEmail, externalId, channel } = data;
    if (!subject || !body) throw new Error('subject_and_body_required');
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const tenant = await Tenant.findOne({ ingestApiKey: hashedKey, deletedAt: null }).exec();
    if (!tenant) throw new Error('invalid_api_key');

    const ticketChannel = channel === 'chat' ? 'web_form' : 'email';
    if (externalId) {
      const existing = await Ticket.findOne({ ...tenantScope(tenant._id.toString()), messageId: externalId }).exec();
      if (existing) {
        // Task 3.3: If it's a known externalId, treat as reply/update if customerEmail matches
        if (customerEmail && existing.customerEmail === customerEmail) {
          await this.handleInboundReply(tenant._id.toString(), existing, customerEmail, body);
          return existing;
        }
        return existing;
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

    const populated = await Ticket.findOne({ _id: ticket._id, ...tenantScope(tenant._id.toString()) }).populate('clientId', 'name domain').exec();

    // Task 3.4: Acknowledgement
    this.sendAcknowledgementEmail(tenant._id.toString(), ticket);

    this.triggerAutoTriage(tenant._id.toString(), ticket._id.toString());
    return populated;
  }

  private async triggerAutoTriage(tenantId: string, ticketId: string) {
    try {
      const tenant = await Tenant.findOne({ _id: tenantId, deletedAt: null }).exec();
      if (tenant?.autoTriageOnInbound) {
        if (shouldUseMock) {
          const orchestrator = new TicketOrchestrator();
          orchestrator.runPipeline(tenantId, ticketId).catch(() => {});
        } else {
          await ticketOrchestrationQueue.add('triage', { tenantId, ticketId }, { jobId: ticketId });
        }
      }
    } catch {}
  }

  async getTicketDetails(tenantId: string, ticketId: string) {
    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) })
      .populate('assigneeId', 'name email')
      .populate('createdById', 'name email')
      .exec();
    if (!ticket) throw new Error('Ticket not found');
    const replies = await TicketReply.find({ ticketId, ...tenantScope(tenantId) })
      .populate('authorId', 'name email')
      .sort({ createdAt: 1 })
      .exec();
    return { ...ticket.toJSON(), replies };
  }

  async addReply({ tenantId, userId, ticketId, data }: { tenantId: string; userId: string; ticketId: string; data: any }) {
    const { body, useAiDraft, type } = data;
    if (!body) throw new Error('Body is required');
    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) });
    if (!ticket) throw new Error('Ticket not found');

    const isInternal = type === 'note';

    const reply = await TicketReply.create({
      tenantId,
      ticketId,
      authorType: 'human',
      authorId: userId,
      body,
      isInternalNote: isInternal,
      type: isInternal ? 'internal_note' : 'public_reply',
    });

    // Task 4.2: Parse Mentions
    await this.handleMentions(tenantId, userId, body, ticket);

    // Only pause SLA and send email if it's NOT an internal note
    if (!isInternal) {
      if (['new', 'triaged', 'awaiting_reply', 'replied'].includes(ticket.status)) {
        ticket.status = 'waiting_on_customer';
        await ticket.save();
        // Task 3.1: Pause SLA Clock
        await this.slaService.pauseSLAClock(tenantId, ticketId);
      }

      if (ticket.customerEmail) {
        reply.deliveryStatus = 'sent';
        await reply.save();
        const notificationService = new NotificationService();
        await notificationService.sendAgentReply(tenantId, ticket, body, useAiDraft);
      }

      try {
        await resolvedSnippetQueue.add('upsert', { tenantId, ticketId });
      } catch {}
    }

    await reply.populate('authorId', 'name email');
    if (!isInternal) {
      this.logUserActions(tenantId, userId, ticket, reply, body, useAiDraft);
    }

    return reply;
  }


  private async logUserActions(tenantId: string, userId: string, ticket: any, reply: any, body: string, useAiDraft: boolean) {
    try {
      await UserAction.create({
        tenantId,
        userId,
        type: 'ticket_reply',
        subjectId: reply._id,
        meta: { ticketId: ticket._id.toString(), useAiDraft: !!useAiDraft },
      });
      if (useAiDraft) {
        await UserAction.create({
          tenantId,
          userId,
          type: 'ai_suggestion_used',
          subjectId: reply._id,
          meta: { ticketId: ticket._id.toString() },
        });

        const originalQuestion = `${ticket.subject || ''}\n\n${ticket.body || ''}`.trim();
        const aiSuggestion = ticket.aiDraft?.body || ticket.aiAnalysis?.suggestedReply || '';
        if (originalQuestion && aiSuggestion && body) {
          const editRatio = computeEditRatio(aiSuggestion, body);
          await AiCorrection.create({
            tenantId,
            ticketId: ticket._id,
            originalQuestion,
            aiSuggestion,
            finalHumanAnswer: body,
            intent: ticket.category,
            tags: [],
            editRatio,
          });
        }
      }
    } catch {}
  }

  async updateTicket(tenantId: string, ticketId: string, updates: any) {
    const allowedUpdates = ['status', 'priority', 'category', 'assigneeId'];
    const safeUpdates: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) safeUpdates[key] = updates[key];
    });

    const existing = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) }).exec();
    if (!existing) throw new Error('Ticket not found');

    const previousAssigneeId = existing.assigneeId ? existing.assigneeId.toString() : null;
    Object.assign(existing, safeUpdates);
    const ticket = await existing.save();
    await ticket.populate('assigneeId', 'name email');

    this.handleAssignmentNotifications(tenantId, ticket, previousAssigneeId);

    if (['closed', 'resolved'].includes(ticket.status)) {
      try {
        await resolvedSnippetQueue.add('upsert', { tenantId, ticketId });
        if (ticket.status === 'closed') {
          await this.sendCsatSurvey(tenantId, ticket);
        }
      } catch {}
    }
    return ticket;
  }

  private async handleAssignmentNotifications(tenantId: string, ticket: any, previousAssigneeId: string | null) {
    const currentAssignee = ticket.assigneeId;
    const newAssigneeId = currentAssignee && currentAssignee._id ? currentAssignee._id.toString() : currentAssignee ? currentAssignee.toString() : null;

    if (previousAssigneeId !== newAssigneeId && newAssigneeId) {
      try {
        const email = currentAssignee?.email;
        const name = currentAssignee?.name || 'there';

        if (email) {
          const notificationService = new NotificationService();
          await notificationService.sendTicketAssigned(tenantId, currentAssignee, ticket);
        }

        const shortId = ticket._id.toString().slice(-6);
        await Notification.create({
          tenantId,
          userId: newAssigneeId,
          type: 'ticket_assigned',
          message: `You were assigned ticket #${shortId}: ${ticket.subject}`,
          url: `/tickets/${ticket._id.toString()}`,
        });
      } catch (error: any) {
        logger.error(`Failed to send assignment notifications: ${error.message}`, error);
      }
    }
  }

  async getWorkflows(tenantId: string, ticketId: string) {
    const runs = await WorkflowRun.find({ ticketId, ...tenantScope(tenantId) }).sort({ startedAt: -1 }).exec();
    return Promise.all(
      runs.map(async (run) => {
        const steps = await WorkflowStep.find({ workflowRunId: run._id, ...tenantScope(tenantId) }).sort({ createdAt: 1 }).exec();
        return { ...run.toJSON(), steps };
      }),
    );
  }

  async getAiReviewTickets(tenantId: string, limitStr: string) {
    const limit = Math.max(Math.min(parseInt(limitStr || '50', 10) || 50, 100), 1);
    const riskyTickets = await Ticket.find({ ...tenantScope(tenantId), 'aiAnalysis.risk': 'high' })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('_id subject aiAnalysis.createdAt aiAnalysis.risk aiAnalysis.faithfulness aiAnalysis.completeness')
      .lean().exec();

    const heavyCorrections = await AiCorrection.find({ ...tenantScope(tenantId), editRatio: { $gte: 0.4 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean().exec();

    const heavyTicketIds = Array.from(new Set(heavyCorrections.map((c: any) => c.ticketId.toString())));
    let heavyTickets: any[] = [];
    if (heavyTicketIds.length > 0) {
      heavyTickets = await Ticket.find({ ...tenantScope(tenantId), _id: { $in: heavyTicketIds } })
        .select('_id subject aiAnalysis.createdAt aiAnalysis.risk aiAnalysis.faithfulness aiAnalysis.completeness')
        .lean().exec();
    }

    const combinedMap = new Map<string, any>();
    riskyTickets.forEach((t) => combinedMap.set(t._id.toString(), t));
    heavyTickets.forEach((t) => {
      if (!combinedMap.has(t._id.toString())) combinedMap.set(t._id.toString(), t);
    });

    const combined = Array.from(combinedMap.values()).sort((a, b) => {
      const aTime = (a.aiAnalysis?.createdAt ? new Date(a.aiAnalysis.createdAt).getTime() : new Date(a.updatedAt || 0).getTime()) || 0;
      const bTime = (b.aiAnalysis?.createdAt ? new Date(b.aiAnalysis.createdAt).getTime() : new Date(b.updatedAt || 0).getTime()) || 0;
      return bTime - aTime;
    });

    return combined.slice(0, limit);
  }

  async getAiMetrics(tenantId: string, sinceStr: string) {
    const match: any = { ...tenantScope(tenantId) };
    if (sinceStr) {
      const sinceDate = new Date(sinceStr);
      if (!isNaN(sinceDate.getTime())) match.createdAt = { $gte: sinceDate };
    }

    return LlmCallLog.aggregate([
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
  }

  async runTriageWorkflow(tenantId: string, ticketId: string, userId: string) {
    const now = Date.now();
    const key = tenantId || 'unknown';
    const bucket = aiRateBuckets.get(key);
    if (!bucket || now - bucket.windowStart > AI_WINDOW_MS) {
      aiRateBuckets.set(key, { count: 1, windowStart: now });
    } else if (bucket.count >= AI_MAX_CALLS_PER_WINDOW) {
      throw new Error('ai_rate_limited');
    } else {
      bucket.count += 1;
    }

    const orchestrator = new TicketOrchestrator();
    return orchestrator.runPipeline(tenantId, ticketId, userId);
  }

  private async sendAcknowledgementEmail(tenantId: string, ticket: any) {
    try {
      const notificationService = new NotificationService();
      await notificationService.sendTicketCreated(tenantId, ticket);
    } catch {}
  }

  private async sendCsatSurvey(tenantId: string, ticket: any) {
    try {
      const notificationService = new NotificationService();
      await notificationService.sendTicketResolved(tenantId, ticket);
    } catch {}
  }

  private async handleMentions(tenantId: string, authorId: string, body: string, ticket: any) {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const matches = body.match(mentionRegex);
    if (!matches) return;

    const author = await User.findOne({ _id: authorId, ...tenantScope(tenantId) }).select('name').exec();
    
    for (const match of matches) {
      const username = match.substring(1);
      const mentionedUser = await User.findOne({ ...tenantScope(tenantId), name: { $regex: new RegExp(`^${username}$`, 'i') } }).exec();
      
      if (mentionedUser) {
        await Notification.create({
          tenantId,
          userId: mentionedUser._id,
          type: 'mention',
          message: `${author?.name || 'Someone'} mentioned you in ticket #${ticket._id.toString().slice(-6)}`,
          url: `/tickets/${ticket._id}`,
        });
      }
    }
  }
}
