import { PipelineContext } from '../pipeline/PipelineContext';
import { LLMProvider } from '../llm/LLMProvider';

export abstract class BaseAgent {
  constructor(protected llm: LLMProvider) {}

  abstract run(context: PipelineContext): Promise<PipelineContext>;
}
