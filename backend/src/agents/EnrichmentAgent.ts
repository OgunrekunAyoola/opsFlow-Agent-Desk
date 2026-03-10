import { BaseAgent } from '../core/agents/BaseAgent';
import { PipelineContext } from '../core/pipeline/PipelineContext';

export class EnrichmentAgent extends BaseAgent {
  async run(context: PipelineContext): Promise<PipelineContext> {
    // In a real app, this would call a CRM integration (Salesforce, HubSpot, etc.)
    // For now, we simulate enrichment based on user context or email
    
    // Mock logic
    context.enrichment = {
      customerTier: 'platinum',
      lifetimeValue: 12500,
      churnRisk: 'low',
      recentOrders: [
        { id: 'ORD-123', status: 'shipped', total: 120 },
        { id: 'ORD-124', status: 'delivered', total: 450 }
      ]
    };

    return context;
  }
}
