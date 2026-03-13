import { BaseAgent } from '../core/agents/BaseAgent';
import { PipelineContext } from '../core/pipeline/PipelineContext';

export class QualityAgent extends BaseAgent {
  async run(context: PipelineContext): Promise<PipelineContext> {
    if (!context.response?.draft) return context;

    const prompt = `
      Review this support response for quality assurance.
      
      User Ticket: ${context.ticket.body}
      Proposed Response: ${context.response.draft}
      
      Check for:
      1. Hallucinations (making up facts not in RAG/Context)
      2. Empathy/Tone
      3. Policy compliance (don't promise things not executed)
      
      Return JSON:
      {
        "score": number (0-100),
        "issues": string[],
        "approved": boolean
      }
    `;

    try {
      const result = await this.llm.generateJSON<{
        score: number;
        issues: string[];
        approved: boolean;
      }>('self_eval', prompt, { tenantId: context.tenantId, ticketId: context.ticketId });

      context.quality = {
        score: result.score,
        issues: result.issues || [],
        approved: result.approved
      };
      
      // If score is too low, we might flag it or stop automation (simple logic for now)
      if (result.score < 70) {
          context.stopReason = `Quality Check Failed: ${result.issues.join(', ')}`;
          // We don't necessarily stop, but we flag it. 
          // If we wanted to stop auto-sending, we'd handle that in Orchestrator.
      }

    } catch (error: unknown) {
      context.quality = {
        score: 0,
        issues: ['QA process failed'],
        approved: false
      };
    }

    return context;
  }
}
