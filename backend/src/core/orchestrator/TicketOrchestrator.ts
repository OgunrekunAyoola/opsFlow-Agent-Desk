import { PipelineContext } from '../pipeline/PipelineContext';
import { GeminiProvider } from '../llm/GeminiProvider';
import { TriageAgent } from '../../agents/TriageAgent';
import { EnrichmentAgent } from '../../agents/EnrichmentAgent';
import { RAGAgent } from '../../agents/RAGAgent';
import { ActionAgent } from '../../agents/ActionAgent';
import { ResponseAgent } from '../../agents/ResponseAgent';
import { QualityAgent } from '../../agents/QualityAgent';
import WorkflowRun from '../../models/WorkflowRun';
import Ticket from '../../models/Ticket';
import TicketReply from '../../models/TicketReply';
import Tenant from '../../models/Tenant';
import UserAction from '../../models/UserAction';
import Notification from '../../models/Notification';
import { emailSendQueue } from '../../queue';
import mongoose from 'mongoose';

export class TicketOrchestrator {
  private llmProvider: GeminiProvider;
  private agents: {
    triage: TriageAgent;
    enrichment: EnrichmentAgent;
    rag: RAGAgent;
    action: ActionAgent;
    response: ResponseAgent;
    quality: QualityAgent;
  };

  constructor() {
    this.llmProvider = new GeminiProvider();
    this.agents = {
      triage: new TriageAgent(this.llmProvider),
      enrichment: new EnrichmentAgent(this.llmProvider),
      rag: new RAGAgent(this.llmProvider),
      action: new ActionAgent(this.llmProvider),
      response: new ResponseAgent(this.llmProvider),
      quality: new QualityAgent(this.llmProvider),
    };
  }

  async runPipeline(tenantId: string, ticketId: string, startedByUserId?: string) {
    console.log(`[Orchestrator] Starting pipeline for ticket ${ticketId}`);

    // 1. Initialize Context
    const ticket = await Ticket.findOne({ _id: ticketId, tenantId });
    if (!ticket) throw new Error('Ticket not found');

    const run = await WorkflowRun.create({
      tenantId,
      ticketId,
      type: 'agent_orchestration',
      status: 'running',
      startedByUserId,
      startedAt: new Date(),
    });

    let context: PipelineContext = {
      tenantId,
      ticketId,
      runId: run._id.toString(),
      ticket: ticket.toObject(),
      shouldStop: false,
    };

    try {
      // 2. Execute Agents Sequence
      // Triage
      context = await this.agents.triage.run(context);
      await this.saveStep(run, 'triage', context.classification);

      // Enrichment
      context = await this.agents.enrichment.run(context);
      await this.saveStep(run, 'enrichment', context.enrichment);

      // RAG
      context = await this.agents.rag.run(context);
      await this.saveStep(run, 'rag', { snippetCount: context.rag?.relevantSnippets.length });

      // Action
      context = await this.agents.action.run(context);
      await this.saveStep(run, 'action', context.actions);

      // Response
      context = await this.agents.response.run(context);
      await this.saveStep(run, 'response', { draftLen: context.response?.draft?.length });

      // Quality
      context = await this.agents.quality.run(context);
      await this.saveStep(run, 'quality', context.quality);

      // 3. Finalize
      await this.finalizeTicket(context);

      run.status = 'succeeded';
      run.finishedAt = new Date();
      await run.save();

      console.log(`[Orchestrator] Pipeline completed for ticket ${ticketId}`);
    } catch (error: any) {
      console.error('[Orchestrator] Pipeline failed:', error);
      run.status = 'failed';
      run.errorMessage = error.message;
      await run.save();
    }

    return run;
  }

  private async saveStep(run: any, stepName: string, output: any) {
    run.steps.push({
      stepName,
      input: {}, // Could capture input if needed
      output,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
    });
    await run.save();
  }

  private async finalizeTicket(context: PipelineContext) {
    const { ticketId, tenantId, classification, response, quality, actions, runId } = context;
    const run = await WorkflowRun.findById(runId);
    const startedByUserId = run?.startedByUserId;

    // Update Ticket Metadata
    const update: any = {};
    if (classification) {
      if (classification.priority) update.priority = classification.priority;
      // We could add tags for category/sentiment
      update['aiAnalysis'] = {
        sentiment: classification.sentiment,
        category: classification.category,
      };
      if (classification.assigneeId) {
        update.assigneeId = classification.assigneeId;
      }
      // Status update
      if (classification.category && context.ticket?.status === 'new') {
        update.status = 'triaged';
      }
    }

    // Save Draft
    if (response?.draft) {
      update['aiDraft'] = {
        body: response.draft,
        confidence: quality?.score ? quality.score / 100 : 0.8,
      };
    }

    await Ticket.updateOne({ _id: ticketId, tenantId }, { $set: update });

    // Handle Auto-Reply Logic
    if (response?.draft && quality?.score) {
      const confidence = quality.score / 100;
      const tenant = await Tenant.findById(tenantId);

      const shouldAttemptAutoReply =
        tenant?.autoReplyEnabled &&
        typeof tenant.autoReplyConfidenceThreshold === 'number' &&
        confidence >= tenant.autoReplyConfidenceThreshold &&
        Array.isArray(tenant.autoReplySafeCategories) &&
        classification?.category &&
        tenant.autoReplySafeCategories.includes(classification.category) &&
        !!context.ticket?.customerEmail;

      if (shouldAttemptAutoReply) {
        const aiReply = await TicketReply.create({
          tenantId,
          ticketId,
          authorType: 'ai',
          body: response.draft,
          deliveryStatus: 'queued',
        });

        await emailSendQueue.add('send', {
          replyId: aiReply._id.toString(),
          to: context.ticket?.customerEmail,
          subject: `Re: ${context.ticket?.subject}`,
          body: aiReply.body,
        });

        await Ticket.updateOne({ _id: ticketId, tenantId }, { $set: { status: 'auto_resolved' } });

        // Log User Action & Notification
        if (startedByUserId) {
          try {
            await UserAction.create({
              tenantId: new mongoose.Types.ObjectId(tenantId),
              userId: new mongoose.Types.ObjectId(startedByUserId),
              type: 'auto_reply_sent',
              subjectId: aiReply._id,
              meta: {
                ticketId,
                category: classification?.category,
                priority: classification?.priority,
                confidence,
              },
            });
            await Notification.create({
              tenantId,
              userId: startedByUserId,
              type: 'auto_reply_sent',
              message: `Auto-reply sent for ticket ${context.ticket?.subject}`,
              url: `/tickets/${ticketId}`,
            });
          } catch {}
        }
      } else if (context.ticket?.status !== 'closed') {
        // If draft created but not auto-sent, set to awaiting_reply or just leave as triaged
        await Ticket.updateOne({ _id: ticketId, tenantId }, { $set: { status: 'awaiting_reply' } });
      }
    }

    // Log AI Triage Run Action
    if (startedByUserId) {
      try {
        await UserAction.create({
          tenantId: new mongoose.Types.ObjectId(tenantId),
          userId: new mongoose.Types.ObjectId(startedByUserId),
          type: 'ai_triage_run',
          subjectId: new mongoose.Types.ObjectId(ticketId),
          meta: { ticketId },
        });
      } catch {}
    }
  }
}
