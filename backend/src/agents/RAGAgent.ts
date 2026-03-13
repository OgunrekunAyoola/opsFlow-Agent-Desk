import { BaseAgent } from '../core/agents/BaseAgent';
import { PipelineContext } from '../core/pipeline/PipelineContext';
import { LLMProvider } from '../core/llm/LLMProvider';
import { RAGService } from '../services/RAGService';
import mongoose from 'mongoose';
import logger from '../shared/utils/logger';

export class RAGAgent extends BaseAgent {
  private ragService: RAGService;

  constructor(llm: LLMProvider) {
    super(llm);
    this.ragService = new RAGService();
  }

  async run(context: PipelineContext): Promise<PipelineContext> {
    if (!context.ticket || !context.ticket.subject) return context;

    const query = `${context.ticket.subject} ${context.ticket.body}`;
    // Ensure tenantId is ObjectId
    const tenantId = new mongoose.Types.ObjectId(context.tenantId);

    try {
      // Search for relevant snippets
      // In a real scenario, we might use the LLM to rewrite the query first
      const results = await this.ragService.search(tenantId, query, 3);

      context.rag = {
        relevantSnippets: results.map((r: { content: string; sourceType: string; score: number; metadata?: Record<string, unknown> }) => ({
          content: r.content,
          source: r.sourceType,
          score: r.score,
          metadata: r.metadata,
        })),
        kbArticles: [],
      };
    } catch (error: unknown) {
      logger.error('RAG Agent failed:', error);
      context.rag = { relevantSnippets: [], kbArticles: [] };
    }

    return context;
  }
}
