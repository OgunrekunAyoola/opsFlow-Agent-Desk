import { BaseAgent } from '../core/agents/BaseAgent';
import { PipelineContext } from '../core/pipeline/PipelineContext';

export class ResponseAgent extends BaseAgent {
  async run(context: PipelineContext): Promise<PipelineContext> {
    const { ticket, classification, enrichment, rag, actions } = context;

    const prompt = `
      Generate a helpful, professional response to this support ticket.
      
      Ticket:
      Subject: ${ticket.subject}
      Body: ${ticket.body}
      
      Context:
      - Category: ${classification?.category}
      - Priority: ${classification?.priority}
      - Sentiment: ${classification?.sentiment}
      - Customer Tier: ${enrichment?.customerTier}
      
      Relevant Knowledge (RAG):
      ${rag?.relevantSnippets.map(s => `- ${s.content}`).join('\n')}
      
      Actions Taken:
      ${actions?.executed.map(a => `- Executed ${a.name}: ${JSON.stringify(a.result)}`).join('\n')}
      
      Instructions:
      1. Be polite and empathetic.
      2. Address the user's issue directly.
      3. Use the knowledge snippets if relevant.
      4. Mention any actions taken (e.g. refund processed).
      5. Keep it concise.
      
      Return JSON:
      {
        "draft": "The response text...",
        "tone": "professional",
        "channel": "email"
      }
    `;

    try {
      const result = await this.llm.generateJSON<{
        draft: string;
        tone: string;
        channel: string;
      }>('answer_generation', prompt, { tenantId: context.tenantId, ticketId: context.ticketId });

      context.response = {
        draft: result.draft,
        tone: result.tone || 'professional',
        channel: result.channel || 'email'
      };
    } catch (error) {
        context.response = {
            draft: "Thank you for contacting support. We have received your request and an agent will review it shortly.",
            tone: "neutral",
            channel: "email"
        };
    }

    return context;
  }
}
