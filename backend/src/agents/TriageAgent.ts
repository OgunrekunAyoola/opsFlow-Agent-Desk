import { BaseAgent } from '../core/agents/BaseAgent';
import { PipelineContext } from '../core/pipeline/PipelineContext';
import User from '../models/User';

export class TriageAgent extends BaseAgent {
  async run(context: PipelineContext): Promise<PipelineContext> {
    const { ticket } = context;

    // Fetch team for routing
    const users = await User.find({ tenantId: context.tenantId });
    const teamContext = users.map((u: import('../models/User').IUser) => `- ${u.name} (ID: ${u._id}, Role: ${u.role})`).join('\n');

    const prompt = `
      Analyze this support ticket and extract:
      1. Category (billing, technical, shipping, general, returns)
      2. Priority (low, medium, high, urgent)
      3. Sentiment (positive, neutral, negative, frustrated)
      4. Assignee (choose best fit from team below, or null)
      
      Team:
      ${teamContext}

      Ticket Subject: ${ticket.subject}
      Ticket Body: ${ticket.body}
      
      Return JSON only.
    `;

    try {
      const result = await this.llm.generateJSON<{
        category: string;
        priority: string;
        sentiment: string;
        assigneeId?: string;
        reasoning: string;
      }>('classification', prompt, { tenantId: context.tenantId, ticketId: context.ticketId });

      context.classification = {
        category: result.category || 'general',
        priority: result.priority || 'medium',
        sentiment: result.sentiment || 'neutral',
        assigneeId: result.assigneeId,
        confidence: 0.9,
        reasoning: result.reasoning || '',
      };
    } catch (error: unknown) {
      // Fallback
      context.classification = {
        category: 'general',
        priority: 'medium',
        sentiment: 'neutral',
        assigneeId: undefined,
        confidence: 0,
        reasoning: 'Classification failed',
      };
    }

    return context;
  }
}
