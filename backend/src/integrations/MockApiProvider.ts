import { IntegrationProvider } from './base';
import { IIntegrationConnection } from '../models/IntegrationConnection';
import SyncedObject from '../models/SyncedObject';
import { RAGService } from '../services/RAGService';
import logger from '../shared/utils/logger';

export class MockApiProvider extends IntegrationProvider {
  constructor() {
    super('mock_api', 'Mock API Service', 'Test integration using API Key', 'api_key');
  }

  async validateApiKey(key: string): Promise<{
    isValid: boolean;
    profile?: any;
  }> {
    // Simulate API key validation
    // In real world, you would call the provider's API endpoint (e.g. /users/me)
    if (key.startsWith('sk_test_')) {
      return {
        isValid: true,
        profile: {
          name: 'API User',
          email: 'api@example.com',
          maskedKey: key.substring(0, 8) + '...',
        },
      };
    }
    return { isValid: false };
  }

  async sync(connection: IIntegrationConnection): Promise<void> {
    logger.info(`Syncing mock_api for ${connection.tenantId}`);
    const ragService = new RAGService();

    // Sync "Orders" as RAG docs
    const orders = [
      { id: 'ord_1', customer: 'Alice', total: 100, items: 'Widget A' },
      { id: 'ord_2', customer: 'Bob', total: 250, items: 'Widget B, Widget C' },
    ];

    for (const order of orders) {
      const existingSync = await SyncedObject.findOne({
        tenantId: connection.tenantId,
        provider: this.name,
        externalId: order.id,
        type: 'order',
      });

      if (existingSync) continue;

      await SyncedObject.create({
        tenantId: connection.tenantId,
        integrationConnectionId: connection._id,
        provider: this.name,
        externalId: order.id,
        type: 'order',
        lastSyncedAt: new Date(),
        metadata: { customer: order.customer, total: order.total },
      });

      try {
        await ragService.upsertDoc(
          connection.tenantId,
          'integration',
          `order_${order.id}`,
          `Order ${order.id} for ${order.customer}: ${order.items}. Total: $${order.total}`,
          { type: 'order', provider: 'mock_api' },
        );
      } catch (err) {
        logger.error(`Failed to upsert RAG doc for order ${order.id}`, err);
      }
      logger.info(`Synced order ${order.id}`);
    }
  }
}
