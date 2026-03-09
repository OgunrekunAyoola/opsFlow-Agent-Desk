import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MockApiProvider } from '../integrations/MockApiProvider';
import IntegrationConnection from '../models/IntegrationConnection';
import SyncedObject from '../models/SyncedObject';
import VectorDoc from '../models/VectorDoc';
import { RAGService } from '../services/RAGService';

dotenv.config();

// We are not mocking RAGService here since we're running in a real node process without jest.
// The MockApiProvider now has a try/catch block around RAG operations so it won't crash if RAG fails.

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/opsflow_agent_desk';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const provider = new MockApiProvider();
    const tenantId = new mongoose.Types.ObjectId();

    // 1. Validate API Key
    console.log('Validating API Key...');
    const validation = await provider.validateApiKey('sk_test_12345678');
    if (!validation.isValid) throw new Error('API Key validation failed');
    console.log('API Key valid:', validation.profile);

    // 2. Create Connection
    console.log('Creating Connection...');
    const connection = await IntegrationConnection.create({
      tenantId,
      provider: provider.name,
      accessToken: 'sk_test_12345678',
      profile: validation.profile,
      status: 'active',
    });
    console.log('Connection created:', connection._id);

    // 3. Sync
    console.log('Syncing...');
    try {
      await provider.sync(connection);
      console.log('Sync completed successfully');
    } catch (err: any) {
      console.error('Sync failed:', err.message || err);
    }

    // 4. Verify Synced Objects
    const syncedObjects = await SyncedObject.find({
      tenantId,
      provider: provider.name,
    });
    console.log(`Found ${syncedObjects.length} synced objects`);

    if (syncedObjects.length > 0) {
      console.log('Sample synced object:', syncedObjects[0].toObject());
    } else {
      console.warn('No objects synced!');
    }

    // 5. Verify Vector Docs (RAG)
    const vectorDocs = await VectorDoc.find({
      tenantId,
      'metadata.provider': provider.name,
    });
    console.log(`Found ${vectorDocs.length} vector docs`);

    if (vectorDocs.length > 0) {
      console.log('Sample vector doc metadata:', vectorDocs[0].metadata);
    } else {
      console.warn('No vector docs found! Check if RAGService is configured with valid API key.');
    }

    // Cleanup
    await IntegrationConnection.deleteMany({ tenantId });
    await SyncedObject.deleteMany({ tenantId });
    await VectorDoc.deleteMany({ tenantId });
    console.log('Cleanup done');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
