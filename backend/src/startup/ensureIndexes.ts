import mongoose from 'mongoose';
import logger from '../shared/utils/logger';

// Import all models to ensure they are registered with Mongoose
import '../models/Tenant';
import '../models/User';
import '../models/Ticket';
import '../models/TicketReply';
import '../models/Client';
import '../models/SLAPolicy';
import '../models/WorkflowRun';
import '../models/WorkflowStep';
import '../models/Notification';
import '../models/UserAction';
import '../models/AiCorrection';
import '../models/LlmCallLog';
import '../models/EventLog';
import '../models/KBArticle';
import '../models/IntegrationConnection';
import '../models/CSAT';
import '../models/VectorDoc';

export async function ensureIndexes() {
  logger.info('[Index] Starting index verification...');
  const start = Date.now();

  try {
    const models = mongoose.modelNames();
    
    for (const modelName of models) {
      const model = mongoose.model(modelName);
      
      // 1. Ensure Tenant Isolation Index
      // Nearly every query uses { tenantId, deletedAt: null }
      if (model.schema.path('tenantId') && model.schema.path('deletedAt')) {
        await model.collection.createIndex({ tenantId: 1, deletedAt: 1 }, { background: true });
        logger.debug(`[Index] Ensured isolation index for ${modelName}`);
      }

      // 2. Model Specific Indexes
      if (modelName === 'Ticket') {
        await model.collection.createIndex({ status: 1, tenantId: 1 }, { background: true });
        await model.collection.createIndex({ customerEmail: 1, tenantId: 1 }, { background: true });
        await model.collection.createIndex({ createdAt: -1, tenantId: 1 }, { background: true });
      }

      if (modelName === 'TicketReply') {
        await model.collection.createIndex({ ticketId: 1, createdAt: 1 }, { background: true });
      }

      if (modelName === 'LlmCallLog') {
        // TTL Index for logs (keep for 30 days)
        await model.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600, background: true });
      }
      
      // Mongoose built-in index synchronization
      await model.ensureIndexes();
    }

    const duration = Date.now() - start;
    logger.info(`[Index] Index verification completed in ${duration}ms`);
  } catch (err: any) {
    logger.error(`Error during index verification: ${err.message}`);
    // We don't want to crash the server if indexing fails, but it's a critical warning
  }
}
