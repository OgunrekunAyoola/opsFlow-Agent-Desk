import IntegrationConnection from '../models/IntegrationConnection';
import { integrationRegistry } from '../integrations';
import { integrationSyncQueue, shouldUseMock } from '../queue';
import logger from '../shared/utils/logger';

export async function executeIntegrationSync(connectionId: string) {
  const connection = await IntegrationConnection.findOne({ _id: connectionId, deletedAt: null }).exec();
  if (!connection) {
    logger.error(`Connection ${connectionId} not found`);
    return;
  }

  const provider = integrationRegistry.get(connection.provider);
  if (!provider) {
    logger.error(`Provider ${connection.provider} not found`);
    return;
  }

  try {
    logger.info(`Starting sync for ${connection.provider} connection ${connectionId}`);
    await provider.sync(connection);
    connection.lastSyncAt = new Date();
    connection.status = 'active';
    await connection.save();
    logger.info(`Sync completed for ${connectionId}`);
  } catch (err) {
    logger.error(`Sync failed for connection ${connectionId}:`, err);
    connection.status = 'error';
    await connection.save();
    throw err;
  }
}

export async function scheduleIntegrationSync(connectionId: string) {
  if (shouldUseMock) {
    // If mocking (no Redis), run inline immediately (or next tick)
    executeIntegrationSync(connectionId).catch((err) => {
      logger.error('Mock sync failed:', err);
    });
  } else {
    // If Redis available, push to queue
    await integrationSyncQueue.add('sync', { connectionId });
  }
}
