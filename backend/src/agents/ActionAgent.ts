import { BaseAgent } from '../core/agents/BaseAgent';
import { PipelineContext } from '../core/pipeline/PipelineContext';
import { ActionService, tools } from '../services/ActionService';
import { LLMProvider } from '../core/llm/LLMProvider';
import logger from '../shared/utils/logger';

export class ActionAgent extends BaseAgent {
  private actionService: ActionService;

  constructor(llm: LLMProvider) {
    super(llm);
    this.actionService = new ActionService();
  }

  async run(context: PipelineContext): Promise<PipelineContext> {
    const availableTools = this.actionService.getTools();
    const { ticket } = context;

    // 1. Determine Action
    const prompt = `
      You are an AI support agent. Determine if any tool should be called to resolve this ticket.
      
      Available Tools:
      ${JSON.stringify(availableTools, null, 2)}
      
      User Ticket:
      Subject: ${ticket.subject}
      Body: ${ticket.body}
      
      Classification: ${JSON.stringify(context.classification)}
      Enrichment: ${JSON.stringify(context.enrichment)}
      
      Instructions:
      1. Analyze the ticket and context.
      2. Select a tool if necessary.
      3. Extract arguments.
      4. If no tool is needed, return actionName: null.
      
      Return JSON:
      {
        "actionName": "tool_name" | null,
        "args": { ... },
        "confidence": number,
        "reason": "explanation"
      }
    `;

    try {
      const decision = await this.llm.generateJSON<{
        actionName: string | null;
        args: Record<string, unknown>;
        confidence: number;
        reason: string;
      }>('classification', prompt, { tenantId: context.tenantId, ticketId: context.ticketId });

      context.actions = {
        recommended: [],
        executed: [],
      };

      if (decision.actionName && decision.confidence > 0.7) {
        context.actions.recommended.push({
          name: decision.actionName,
          args: decision.args,
          confidence: decision.confidence,
          reason: decision.reason,
        });

        // Execute if high confidence
        if (decision.confidence > 0.85) {
          try {
            const toolDef = tools[decision.actionName];

            if (toolDef) {
              const result = await toolDef.execute(decision.args, {
                tenantId: context.tenantId,
                ticketId: context.ticketId,
                userId: context.user ? String((context.user as unknown as { _id: string })._id) : undefined,
              });

              context.actions.executed.push({
                name: decision.actionName,
                result,
                timestamp: new Date(),
              });
            }
          } catch (execError: unknown) {
            logger.error('Tool execution failed:', execError);
            const msg = execError instanceof Error ? execError.message : String(execError);
            context.actions.executed.push({
              name: decision.actionName,
              result: { error: msg },
              timestamp: new Date(),
            });
          }
        }
      }
    } catch (error: unknown) {
      logger.error('Action determination failed:', error);
    }

    return context;
  }
}
