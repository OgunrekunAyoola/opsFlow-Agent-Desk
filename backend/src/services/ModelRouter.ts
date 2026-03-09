import dotenv from 'dotenv';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

dotenv.config();

type TaskType = 'classification' | 'answer_generation' | 'self_eval';

interface ModelConfig {
  id: string;
  provider: 'gemini' | 'openai' | 'anthropic';
  model: string;
}

interface RouterOptions {
  task: TaskType;
  tenantId: string;
}

export class ModelRouter {
  private getConfig(task: TaskType): ModelConfig {
    const classification = process.env.MODEL_CLASSIFICATION || 'gemini-1.5-flash';
    const answer = process.env.MODEL_ANSWER || 'gemini-1.5-pro';
    const selfEval = process.env.MODEL_SELF_EVAL || classification;

    if (task === 'classification') {
      return { id: 'classification', provider: 'gemini', model: classification };
    }
    if (task === 'self_eval') {
      return { id: 'self_eval', provider: 'gemini', model: selfEval };
    }
    return { id: 'answer', provider: 'gemini', model: answer };
  }

  getModel({ task }: RouterOptions) {
    const cfg = this.getConfig(task);
    if (cfg.provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured');
      }
      return new ChatGoogleGenerativeAI({
        model: cfg.model,
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.2,
      });
    }

    throw new Error('Only Gemini provider is implemented in ModelRouter');
  }
}
