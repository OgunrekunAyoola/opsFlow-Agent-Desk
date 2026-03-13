import mongoose from 'mongoose';
import { ITicket } from '../../models/Ticket';
import { IUser } from '../../models/User';

export interface CustomerProfile {
  totalTickets: number;
  averageResolutionTimeHours?: number;
  commonCategory?: string;
  accountAgeDays?: number;
  subscriptionTier?: string;
  customerTier?: string;
  lifetimeValue?: number;
  churnRisk?: string;
  recentOrders?: Record<string, unknown>[];
}

export interface TriageResult {
  category: string;
  priority: string;
  sentiment: string;
  assigneeId?: string;
  confidence: number;
  reasoning: string;
  suggestedAssignee?: string;
}

export interface RAGChunk {
  content: string;
  source: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RAGResult {
  relevantSnippets: RAGChunk[];
  kbArticles?: Record<string, unknown>[];
}

export interface ActionResult {
  toolName?: string;
  name?: string;
  input?: Record<string, unknown>;
  args?: Record<string, unknown>;
  output?: Record<string, unknown>;
  result?: Record<string, unknown>;
  success?: boolean;
  timestamp?: Date;
  confidence?: number;
  reason?: string;
}

export interface ActionsResult {
  recommended: ActionResult[];
  executed: ActionResult[];
}

export interface DraftResult {
  draft: string;
  content?: string;
  channel: string;
  tone: string;
}

export interface QualityResult {
  confidenceScore?: number;
  score: number;
  flags?: string[];
  issues: string[];
  approved: boolean;
  reasoning?: string;
}

export interface PipelineContext {
  tenantId: string;
  ticketId: string;
  runId: string;
  
  ticket: ITicket;
  user?: IUser;

  classification?: TriageResult;
  enrichment?: CustomerProfile;
  rag?: RAGResult;
  actions?: ActionsResult;
  response?: DraftResult;
  quality?: QualityResult;

  shouldStop: boolean;
  stopReason?: string;
}
