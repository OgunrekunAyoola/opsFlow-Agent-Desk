import { BaseAgent } from '../core/agents/BaseAgent';
import { PipelineContext } from '../core/pipeline/PipelineContext';
import { CustomerDataService } from '../services/CustomerDataService';

export class EnrichmentAgent extends BaseAgent {
  async run(context: PipelineContext): Promise<PipelineContext> {
    const service = new CustomerDataService();
    const email = context.ticket?.customerEmail || '';
    
    context.enrichment = await service.getProfile(context.tenantId, email);
    
    return context;
  }
}
