import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ModelRouter } from '../../services/ModelRouter';
import LlmCallLog from '../../models/LlmCallLog';
import { LLMProvider } from './LLMProvider';

dotenv.config();

export class GeminiProvider implements LLMProvider {
  private router: ModelRouter;
  private failureCount = 0;
  private circuitState: 'closed' | 'open' | 'half-open' = 'closed';
  private nextAttemptAt: number | null = null;

  constructor() {
    this.router = new ModelRouter();
  }

  async generateJSON<T = any>(
    task: string,
    prompt: string,
    meta?: { tenantId?: string; ticketId?: string }
  ): Promise<T> {
    const model = this.router.getModel({ task: task as any, tenantId: meta?.tenantId || 'global' });

    // Circuit Breaker Check
    const now = Date.now();
    if (this.circuitState === 'open') {
      if (this.nextAttemptAt && now < this.nextAttemptAt) {
        throw new Error('LLM circuit breaker open');
      }
      this.circuitState = 'half-open';
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
            ? content.map((c: any) => String(c?.text || '')).join('')
            : String(content ?? '');
        
        // Simple JSON extraction if wrapped in markdown code blocks
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : text;
        
        const parsed = JSON.parse(jsonStr);

        // Success - Reset Circuit
        this.failureCount = 0;
        this.circuitState = 'closed';

        await LlmCallLog.create({
          tenantId: meta?.tenantId ? new mongoose.Types.ObjectId(meta.tenantId) : undefined,
          ticketId: meta?.ticketId ? new mongoose.Types.ObjectId(meta.ticketId) : undefined,
          task,
          modelName: (model as any).modelName || 'unknown',
          success: true,
          latencyMs: Date.now() - startedAt,
        });

        return parsed as T;
      } catch (error: any) {
        lastError = error;
        this.failureCount += 1;
        if (this.failureCount >= 5) {
          this.circuitState = 'open';
          this.nextAttemptAt = Date.now() + 5 * 60 * 1000;
        }
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
      }
    }
    
    // Log failure
    await LlmCallLog.create({
        tenantId: meta?.tenantId ? new mongoose.Types.ObjectId(meta.tenantId) : undefined,
        ticketId: meta?.ticketId ? new mongoose.Types.ObjectId(meta.ticketId) : undefined,
        task,
        modelName: (model as any).modelName || 'unknown',
        success: false,
        error: lastError?.message,
        latencyMs: Date.now() - startedAt,
      });

    throw lastError;
  }

  async generateText(
    task: string,
    prompt: string,
    meta?: { tenantId?: string; ticketId?: string }
  ): Promise<string> {
    const model = this.router.getModel({ task: task as any, tenantId: meta?.tenantId || 'global' });
    
    const startedAt = Date.now();
    try {
        const msg: any = await model.invoke(prompt);
        const content = msg?.content;
        const text =
          typeof content === 'string'
            ? content
            : Array.isArray(content)
            ? content.map((c: any) => String(c?.text || '')).join('')
            : String(content ?? '');
        
        await LlmCallLog.create({
            tenantId: meta?.tenantId ? new mongoose.Types.ObjectId(meta.tenantId) : undefined,
            ticketId: meta?.ticketId ? new mongoose.Types.ObjectId(meta.ticketId) : undefined,
            task,
            modelName: (model as any).modelName || 'unknown',
            success: true,
            latencyMs: Date.now() - startedAt,
        });
        
        return text;
    } catch (error: any) {
        await LlmCallLog.create({
            tenantId: meta?.tenantId ? new mongoose.Types.ObjectId(meta.tenantId) : undefined,
            ticketId: meta?.ticketId ? new mongoose.Types.ObjectId(meta.ticketId) : undefined,
            task,
            modelName: (model as any).modelName || 'unknown',
            success: false,
            error: error.message,
            latencyMs: Date.now() - startedAt,
        });
        throw error;
    }
  }
}
