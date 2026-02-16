import mongoose from 'mongoose';
import Ticket from '../models/Ticket';
import User from '../models/User';
import WorkflowRun from '../models/WorkflowRun';
import WorkflowStep from '../models/WorkflowStep';
import TicketReply from '../models/TicketReply';
import Tenant from '../models/Tenant';
import UserAction from '../models/UserAction';
import { emailSendQueue } from '../queue/index';
import { GeminiLLMService } from './GeminiLLMService';

interface RunOptions {
  tenantId: string;
  ticketId: string;
  startedByUserId: string;
}

export class TicketTriageWorkflow {
  private llmService: GeminiLLMService;

  constructor() {
    this.llmService = new GeminiLLMService();
  }

  async run({ tenantId, ticketId, startedByUserId }: RunOptions) {
    // 1. Start Workflow Run
    const run = await WorkflowRun.create({
      tenantId,
      type: 'ticket_triage',
      ticketId,
      status: 'running',
      startedByUserId,
      startedAt: new Date(),
    });

    const useRealLLM = !!process.env.GEMINI_API_KEY;
    console.log(`Starting Triage Workflow. Real LLM Enabled: ${useRealLLM}`);

    try {
      // 2. Fetch Context
      const ticket = await Ticket.findOne({ _id: ticketId, tenantId });
      if (!ticket) throw new Error('Ticket not found');

      const users = await User.find({ tenantId });

      // 3. Step: Classification
      let categoryResult;
      if (useRealLLM) {
        try {
          categoryResult = await this.llmService.classifyTicket(ticket.subject, ticket.body);
        } catch (e) {
          console.error('LLM Classification failed, falling back to mock:', e);
          categoryResult = await this.mockLlmClassify(ticket);
        }
      } else {
        categoryResult = await this.mockLlmClassify(ticket);
      }
      await this.saveStep(
        run,
        'classification',
        { ticketSubject: ticket.subject, ticketBody: ticket.body },
        categoryResult,
      );

      // 4. Step: Priority
      let priorityResult;
      if (useRealLLM) {
        try {
          priorityResult = await this.llmService.prioritizeTicket(
            ticket.subject,
            ticket.body,
            categoryResult.category,
          );
        } catch (e) {
          console.error('LLM Priority failed, falling back to mock:', e);
          priorityResult = await this.mockLlmPriority(ticket, categoryResult.category);
        }
      } else {
        priorityResult = await this.mockLlmPriority(ticket, categoryResult.category);
      }
      await this.saveStep(run, 'priority', { category: categoryResult.category }, priorityResult);

      // 5. Step: Assignee Suggestion
      let assigneeResult;
      const teamForLLM = users.map((u) => ({ id: u._id.toString(), name: u.name, role: u.role }));

      if (useRealLLM) {
        try {
          assigneeResult = await this.llmService.suggestAssignee(
            ticket.subject,
            ticket.body,
            categoryResult.category,
            teamForLLM,
          );
        } catch (e) {
          console.error('LLM Assignee failed, falling back to mock:', e);
          assigneeResult = await this.mockLlmAssignee(ticket, users, categoryResult.category);
        }
      } else {
        assigneeResult = await this.mockLlmAssignee(ticket, users, categoryResult.category);
      }
      await this.saveStep(run, 'assignee_suggestion', { teamSize: users.length }, assigneeResult);

      // 6. Step: Reply Draft
      let replyResult;
      if (useRealLLM) {
        try {
          replyResult = await this.llmService.draftReply(
            ticket.subject,
            ticket.body,
            categoryResult.category,
            priorityResult.priority,
            ticket.customerName || undefined,
          );
        } catch (e) {
          console.error('LLM Reply failed, falling back to mock:', e);
          replyResult = await this.mockLlmReplyDraft(
            ticket,
            categoryResult.category,
            priorityResult.priority,
          );
        }
      } else {
        replyResult = await this.mockLlmReplyDraft(
          ticket,
          categoryResult.category,
          priorityResult.priority,
        );
      }
      await this.saveStep(
        run,
        'reply_draft',
        { category: categoryResult.category, priority: priorityResult.priority },
        replyResult,
      );

      const confidence =
        typeof (replyResult as any).confidence === 'number'
          ? (replyResult as any).confidence
          : this.computeConfidence(categoryResult.category, priorityResult.priority);

      // 7. Persist Changes

      // Update Ticket
      ticket.category = categoryResult.category as any;
      ticket.priority = priorityResult.priority as any;
      if (ticket.status !== 'closed') {
        ticket.status = 'triaged' as any;
      }
      if (assigneeResult.assigneeId) {
        ticket.assigneeId = assigneeResult.assigneeId as any;
      }

      ticket.isAiTriaged = true;

      ticket.aiDraft = {
        body: this.sanitizeReply(replyResult.replyBody),
        confidence,
      };

      // Update aiAnalysis for backward compatibility / quick access
      ticket.aiAnalysis = {
        suggestedCategory: categoryResult.category,
        suggestedReply: this.sanitizeReply(replyResult.replyBody),
        summary: `AI Triage: Classified as ${categoryResult.category} with ${priorityResult.priority} priority.`,
        sentiment: 'neutral',
        priorityScore: confidence,
      };

      const tenant = await Tenant.findById(tenantId).exec();

      await ticket.save();

      // Create AI Reply Draft
      const aiReply = await TicketReply.create({
        tenantId,
        ticketId,
        authorType: 'ai',
        body: this.sanitizeReply(replyResult.replyBody),
      });

      const shouldAttemptAutoReply =
        tenant?.autoReplyEnabled &&
        typeof tenant.autoReplyConfidenceThreshold === 'number' &&
        confidence >= tenant.autoReplyConfidenceThreshold &&
        Array.isArray(tenant.autoReplySafeCategories) &&
        tenant.autoReplySafeCategories.includes(categoryResult.category) &&
        !!ticket.customerEmail;

      if (shouldAttemptAutoReply) {
        aiReply.deliveryStatus = 'queued';
        await aiReply.save();
        await emailSendQueue.add('send', {
          replyId: aiReply._id.toString(),
          to: ticket.customerEmail,
          subject: `Re: ${ticket.subject}`,
          body: aiReply.body,
        });
        if (ticket.status !== 'closed') {
          ticket.status = 'auto_resolved' as any;
          await ticket.save();
        }
        try {
          await UserAction.create({
            tenantId: new mongoose.Types.ObjectId(tenantId),
            userId: new mongoose.Types.ObjectId(startedByUserId),
            type: 'auto_reply_sent',
            subjectId: aiReply._id,
            meta: {
              ticketId,
              category: categoryResult.category,
              priority: priorityResult.priority,
              confidence,
            },
          });
        } catch {}
      } else if (ticket.status !== 'closed') {
        ticket.status = 'awaiting_reply' as any;
        await ticket.save();
      }

      // Complete Run
      run.status = 'succeeded';
      run.finishedAt = new Date();
      await run.save();

      return {
        run,
        ticket,
        aiReply,
      };
    } catch (err: any) {
      console.error('Workflow Failed:', err);
      run.status = 'failed';
      run.errorMessage = err.message;
      run.finishedAt = new Date();
      await run.save();
      throw err;
    }
  }

  private async saveStep(run: any, stepType: string, input: any, output: any) {
    await WorkflowStep.create({
      tenantId: run.tenantId,
      workflowRunId: run._id,
      stepType,
      inputSnapshot: input,
      outputSnapshot: output,
    });
  }

  // --- Mock LLM Methods (Fallback) ---

  private async mockLlmClassify(ticket: any) {
    const text = (ticket.subject + ' ' + ticket.body).toLowerCase();
    let category = 'general';
    if (text.match(/bill|invoice|charge|cost|price/)) category = 'billing';
    else if (text.match(/bug|error|fail|crash|broken/)) category = 'bug';
    else if (text.match(/feature|request|add|idea/)) category = 'feature_request';

    return {
      category,
      reason: `(Mock) Detected keywords in text matching '${category}' category.`,
    };
  }

  private async mockLlmPriority(ticket: any, category: string) {
    const text = (ticket.subject + ' ' + ticket.body).toLowerCase();
    let priority = 'medium';
    if (text.match(/urgent|asap|critical|blocked|immediately/)) priority = 'high';
    else if (text.match(/typo|minor|low|whenever/)) priority = 'low';

    return { priority, reason: `(Mock) Based on keywords and category '${category}'.` };
  }

  private async mockLlmAssignee(ticket: any, users: any[], category: string) {
    // Simple logic: pick the first user for now
    const assignee = users.length > 0 ? users[0] : null;
    return {
      assigneeId: assignee?._id || null, // Normalize for compat
      reason: assignee
        ? `(Mock) Auto-assigned to ${assignee.name} (available agent).`
        : 'No users found in team.',
    };
  }

  private async mockLlmReplyDraft(ticket: any, category: string, priority: string) {
    let body = `Hi ${ticket.customerName || 'there'},\n\n`;

    if (category === 'billing') {
      body += `Thanks for contacting us regarding your billing inquiry. I'm reviewing your account details and will get back to you shortly.\n`;
    } else if (category === 'bug') {
      body += `I'm sorry to hear you're experiencing this issue. Could you please provide steps to reproduce it or any screenshots?\n`;
    } else if (category === 'feature_request') {
      body += `Thanks for the great suggestion! I've passed this on to our product team for consideration.\n`;
    } else {
      body += `Thanks for reaching out. We have received your request and are looking into it.\n`;
    }

    body += `\nBest regards,\nSupport Team`;

    return { replyBody: body };
  }

  private computeConfidence(category: string, priority: string) {
    if (category === 'billing') return 0.6;
    if (priority === 'urgent' || priority === 'high') return 0.9;
    if (priority === 'medium') return 0.8;
    return 0.75;
  }

  private sanitizeReply(text: string) {
    const patterns = [/credit\s*card\s*number/gi, /password/gi, /ssn|social\s*security\s*number/gi];
    let safe = text;
    patterns.forEach((p) => {
      safe = safe.replace(p, '[redacted]');
    });
    return safe;
  }
}
