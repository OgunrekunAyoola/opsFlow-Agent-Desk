import Ticket from '../../models/Ticket';
import User from '../../models/User';

export interface PipelineContext {
  // Metadata
  tenantId: string;
  ticketId: string;
  runId: string; // WorkflowRun ID

  // Data State
  ticket: any; // Ticket document
  user?: any; // User document (if internal) or sender info

  // Agent Outputs
  classification?: {
    category: string;
    priority: string;
    sentiment: string;
    assigneeId?: string;
    confidence: number;
    reasoning: string;
  };

  enrichment?: {
    customerTier?: string;
    recentOrders?: any[];
    lifetimeValue?: number;
    churnRisk?: string;
  };

  rag?: {
    relevantSnippets: any[];
    kbArticles: any[];
  };

  actions?: {
    recommended: Array<{
      name: string;
      args: any;
      confidence: number;
      reason: string;
    }>;
    executed: Array<{
      name: string;
      result: any;
      timestamp: Date;
    }>;
  };

  response?: {
    draft: string;
    tone: string;
    channel: string; // email, chat, etc.
  };

  quality?: {
    score: number;
    issues: string[];
    approved: boolean;
  };

  // Execution Flags
  shouldStop: boolean;
  stopReason?: string;
}
