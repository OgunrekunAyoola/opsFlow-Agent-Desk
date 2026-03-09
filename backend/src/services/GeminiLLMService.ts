import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ModelRouter } from './ModelRouter';
import LlmCallLog from '../models/LlmCallLog';
import { ActionService } from './ActionService';

dotenv.config();

type TaskKind = 'classification' | 'answer_generation' | 'self_eval';

export class GeminiLLMService {
  private router: ModelRouter;
  private actionService: ActionService;
  private disabledUntil: number | null = null;
  private failureCount = 0;
  private circuitState: 'closed' | 'open' | 'half-open' = 'closed';
  private nextAttemptAt: number | null = null;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing. Service will throw error if used.');
    }
    this.router = new ModelRouter();
    this.actionService = new ActionService();
  }

  public getActionService() {
    return this.actionService;
  }

  async determineAction(
    subject: string,
    body: string,
    meta?: { tenantId?: string; ticketId?: string },
  ): Promise<{ actionName: string | null; args: any; confidence: number }> {
    const tools = this.actionService.getTools();

    if (!process.env.GEMINI_API_KEY) {
      // Fallback to mock logic if no API key
      const text = (subject + ' ' + body).toLowerCase();
      if (text.includes('refund') && text.includes('order')) {
        return {
          actionName: 'refund_order',
          args: { orderId: 'ORD-999', reason: 'Customer requested refund' },
          confidence: 0.9,
        };
      }
      if (text.includes('status') || text.includes('track')) {
        return {
          actionName: 'check_order_status',
          args: { orderId: 'ORD-123' },
          confidence: 0.8,
        };
      }
      if (text.includes('escalate') || text.includes('manager') || text.includes('supervisor')) {
        return {
          actionName: 'escalate_ticket',
          args: { reason: 'Customer requested escalation' },
          confidence: 0.95,
        };
      }
      return { actionName: null, args: {}, confidence: 0 };
    }

    const prompt = `
You are an AI support agent triage system.
Your goal is to determine if any of the available tools should be called to resolve the user's request.

Available Tools:
${JSON.stringify(tools, null, 2)}

User Ticket:
Subject: ${subject}
Body: ${body}

Instructions:
1. Analyze the ticket content.
2. If a tool is relevant and necessary, select it.
3. Extract arguments from the ticket content. If arguments are missing, use null.
4. If no tool is relevant, return actionName: null.
5. Return JSON only.

Output Format:
{
  "actionName": "tool_name" | null,
  "args": { ... },
  "confidence": number (0.0 - 1.0)
}
`;

    try {
      const result = await this.generateJSON('classification', prompt, meta);
      return {
        actionName: result.actionName || null,
        args: result.args || {},
        confidence: typeof result.confidence === 'number' ? result.confidence : 0,
      };
    } catch (e) {
      console.error('Action determination failed:', e);
      return { actionName: null, args: {}, confidence: 0 };
    }
  }

  private async generateJSON(
    task: TaskKind,
    prompt: string,
    meta?: { tenantId?: string; ticketId?: string },
  ): Promise<any> {
    const model = this.router.getModel({ task, tenantId: meta?.tenantId || 'global' });

    const now = Date.now();
    if (this.circuitState === 'open') {
      if (this.nextAttemptAt && now < this.nextAttemptAt) {
        throw new Error('LLM circuit breaker open');
      }
      this.circuitState = 'half-open';
    } else if (
      this.circuitState === 'half-open' &&
      this.nextAttemptAt &&
      now < this.nextAttemptAt
    ) {
      throw new Error('LLM circuit breaker half-open');
    }

    if (this.disabledUntil && now < this.disabledUntil) {
      throw new Error('LLM temporarily disabled');
    }

    const maxAttempts = 4;
    let attempt = 0;
    let lastError: any;
    const startedAt = Date.now();

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const msg: any = await model.invoke(prompt);
        const content = msg?.content;
        const text =
          typeof content === 'string'
            ? content
            : Array.isArray(content)
              ? content.map((c: any) => String(c?.text || c?.toString?.() || '')).join('')
              : String(content ?? '');
        const parsed = JSON.parse(text);
        this.failureCount = 0;
        this.circuitState = 'closed';
        this.nextAttemptAt = null;
        try {
          await LlmCallLog.create({
            tenantId: meta?.tenantId ? new mongoose.Types.ObjectId(meta.tenantId) : undefined,
            ticketId: meta?.ticketId ? new mongoose.Types.ObjectId(meta.ticketId) : undefined,
            task,
            modelName: (model as any).modelName || 'unknown',
            success: true,
            latencyMs: Date.now() - startedAt,
          });
        } catch {}
        return parsed;
      } catch (error: any) {
        lastError = error;
        console.error('Gemini generation error:', error);
        const msg = String(error?.message || error);
        const rateLimited = error?.status === 429 || /quota|rate/i.test(msg);
        if (rateLimited) {
          this.disabledUntil = Date.now() + 5 * 60 * 1000;
        }
        this.failureCount += 1;
        if (this.failureCount >= 5) {
          this.circuitState = 'open';
          this.nextAttemptAt = Date.now() + 5 * 60 * 1000;
        }
        if (attempt >= maxAttempts) {
          break;
        }
        const delayMs = 1000 * 2 ** (attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    try {
      await LlmCallLog.create({
        tenantId: meta?.tenantId ? new mongoose.Types.ObjectId(meta.tenantId) : undefined,
        ticketId: meta?.ticketId ? new mongoose.Types.ObjectId(meta.ticketId) : undefined,
        task,
        modelName: 'unknown',
        success: false,
        errorMessage: String(lastError?.message || lastError),
        latencyMs: Date.now() - startedAt,
      });
    } catch {}

    throw lastError;
  }

  // Level 2: Action Agent Capability - REMOVED DUPLICATE

  async classifyTicket(
    subject: string,
    body: string,
    meta?: { tenantId?: string; ticketId?: string },
  ): Promise<{
    category: string;
    reason: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }> {
    const prompt = `
      You are an expert support ticket classifier.
      Analyze the following ticket:
      Subject: "${subject}"
      Body: "${body}"

      Classify it into exactly one of these categories:
      - bug (technical issues, errors)
      - feature_request (new capabilities)
      - billing (invoices, payments)
      - general (questions, how-to)
      - other (spam, irrelevant)

      Also analyze the sentiment:
      - positive
      - neutral
      - negative

      Return a JSON object with:
      - "category": One of the above strings.
      - "reason": A concise explanation (max 1 sentence).
      - "sentiment": One of the above sentiment strings.
    `;

    return this.generateJSON('classification', prompt, meta);
  }

  async prioritizeTicket(
    subject: string,
    body: string,
    category: string,
    meta?: { tenantId?: string; ticketId?: string },
  ): Promise<{ priority: string; reason: string }> {
    const prompt = `
      Analyze this support ticket:
      Subject: "${subject}"
      Body: "${body}"
      Category: "${category}"

      Determine the priority level:
      - urgent (system down, data loss, security)
      - high (core feature broken, blocking workflow)
      - medium (standard issue, annoyance)
      - low (typo, minor ui, nice to have)

      Return a JSON object with:
      - "priority": One of the above strings.
      - "reason": A concise explanation (max 1 sentence).
    `;

    return this.generateJSON('classification', prompt, meta);
  }

  async suggestAssignee(
    subject: string,
    body: string,
    category: string,
    teamMembers: { id: string; name: string; role: string }[],
    meta?: { tenantId?: string; ticketId?: string },
  ): Promise<{ assigneeId: string | null; reason: string }> {
    const teamContext = teamMembers
      .map((u) => `- ID: ${u.id}, Name: ${u.name}, Role: ${u.role}`)
      .join('\n');

    const prompt = `
      Ticket Context:
      Subject: "${subject}"
      Body: "${body}"
      Category: "${category}"

      Available Team Members:
      ${teamContext}

      Suggest the best assignee based on role and context.
      If no specific match is obvious, pick a general support member or admin.
      If the team list is empty, return null.

      Return a JSON object with:
      - "assigneeId": The ID string of the selected user, or null.
      - "reason": A concise explanation (max 1 sentence).
    `;

    return this.generateJSON('classification', prompt, meta);
  }

  async draftReply(
    subject: string,
    body: string,
    category: string,
    priority: string,
    customerName?: string,
    contextDocs: string[] = [],
    meta?: { tenantId?: string; ticketId?: string },
  ): Promise<{ replyBody: string; confidence: number }> {
    const contextText =
      contextDocs.length > 0 ? contextDocs.join('\n\n') : 'No additional context provided.';

    const prompt = `
      You are a helpful support agent. Draft a reply to this ticket.

      Ticket Details:
      Subject: "${subject}"
      Body: "${body}"
      Category: "${category}"
      Priority: "${priority}"
      Customer Name: "${customerName || 'Customer'}"

      Relevant Context (KB Articles, Past Tickets):
      ${contextText}

      Instructions:
      1. Use the provided context to answer the user's question directly if possible.
      2. If the context contains a solution, provide it clearly.
      3. If the context is insufficient, ask clarifying questions or acknowledge the issue and say you'll investigate.
      4. Be polite, professional, and empathetic.
      5. Sign off as "OpsFlow Support Team".

      Return a JSON object with:
      - "replyBody": The full text of the email reply.
      - "confidence": A number between 0.0 and 1.0 indicating how confident you are that this reply resolves the issue based on the context.
    `;

    return this.generateJSON('answer_generation', prompt, meta);
  }

  async selfEvaluate(
    question: string,
    context: string,
    answer: string,
    meta?: { tenantId?: string; ticketId?: string },
  ): Promise<{
    faithfulness: 'high' | 'medium' | 'low';
    completeness: 'high' | 'medium' | 'low';
    risk: 'low' | 'medium' | 'high';
    explanation: string;
  }> {
    const prompt = `
      You are evaluating an AI-generated support answer.

      Question:
      "${question}"

      Context:
      "${context}"

      Answer:
      "${answer}"

      Evaluate and return JSON with:
      - "faithfulness": "high" | "medium" | "low"
      - "completeness": "high" | "medium" | "low"
      - "risk": "low" | "medium" | "high"
      - "explanation": one or two short sentences explaining your scores.
    `;

    return this.generateJSON('self_eval', prompt, meta);
  }
}
