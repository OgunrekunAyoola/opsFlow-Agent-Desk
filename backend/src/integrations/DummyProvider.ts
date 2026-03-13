import { IntegrationProvider } from './base';
import { IIntegrationConnection } from '../models/IntegrationConnection';
import Ticket from '../models/Ticket';
import SyncedObject from '../models/SyncedObject';
import mongoose from 'mongoose';
import { RAGService } from '../services/RAGService';
import logger from '../shared/utils/logger';

function log(msg: string) {
  logger.info(msg);
}

export class DummyProvider extends IntegrationProvider {
  constructor() {
    super('dummy', 'Dummy Integration', 'A test integration for development', 'oauth2');
  }

  getAuthUrl(state?: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${frontendUrl}/settings/integrations/callback?provider=dummy&code=dummy_code&state=${state || ''}`;
  }

  async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    profile?: any;
  }> {
    if (code !== 'dummy_code') {
      throw new Error('Invalid code');
    }
    return {
      accessToken: 'dummy_access_token',
      refreshToken: 'dummy_refresh_token',
      expiresAt: new Date(Date.now() + 3600 * 1000),
      profile: {
        name: 'Dummy User',
        email: 'dummy@example.com',
        externalId: 'dummy_user_123',
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    return {
      accessToken: 'new_dummy_access_token',
      refreshToken: 'new_dummy_refresh_token',
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
  }

  async sync(connection: IIntegrationConnection): Promise<void> {
    log(`Syncing dummy integration for tenant ${connection.tenantId}`);
    const ragService = new RAGService();

    // 1. Sync Tickets
    const externalTickets = [
      {
        id: 'ticket_1',
        subject: 'Dummy Ticket 1',
        body: 'This is a test ticket from Dummy Provider',
        customerEmail: 'customer1@example.com',
        customerName: 'Customer One',
        status: 'new',
      },
      {
        id: 'ticket_2',
        subject: 'Dummy Ticket 2',
        body: 'Another test ticket',
        customerEmail: 'customer2@example.com',
        customerName: 'Customer Two',
        status: 'open',
      },
    ];

    for (const extTicket of externalTickets) {
      log(`Processing ticket ${extTicket.id}`);
      // Check if already synced
      const existingSync = await SyncedObject.findOne({
        tenantId: connection.tenantId,
        provider: this.name,
        externalId: extTicket.id,
        type: 'ticket',
      });

      if (existingSync) {
        log(`Ticket ${extTicket.id} already synced`);
        continue;
      }

      // Create Ticket
      try {
        const ticket = new Ticket({
          tenantId: connection.tenantId,
          subject: extTicket.subject,
          body: extTicket.body,
          status: extTicket.status === 'open' ? 'new' : extTicket.status, // Map 'open' to 'new'
          priority: 'medium',
          customerEmail: extTicket.customerEmail,
          customerName: extTicket.customerName,
          channel: 'integration', // Important for verify script
        });
        await ticket.save();
        log(`Created ticket ${ticket._id}`);

        // Create SyncedObject
        await SyncedObject.create({
          tenantId: connection.tenantId,
          integrationConnectionId: connection._id,
          provider: this.name,
          externalId: extTicket.id,
          internalId: ticket._id,
          type: 'ticket',
          lastSyncedAt: new Date(),
          metadata: { originalStatus: extTicket.status },
        });
        log(`Created SyncedObject for ticket ${extTicket.id}`);

        // RAG
        await ragService.upsertDoc(
          connection.tenantId,
          'integration',
          ticket._id.toString(),
          `${extTicket.subject}\n${extTicket.body}`,
          { type: 'ticket', provider: 'dummy' },
        );
        log(`Upserted RAG doc for ticket ${extTicket.id}`);
      } catch (err) {
        logger.error(`Error syncing ticket ${extTicket.id}:`, err);
      }
    }

    // 2. Sync Docs (KB Articles)
    const externalDocs = [
      {
        id: 'doc_1',
        title: 'How to use Dummy',
        content: 'Dummy integration is easy to use. Just click connect.',
        url: 'https://dummy.com/docs/1',
      },
      {
        id: 'doc_2',
        title: 'Troubleshooting Dummy',
        content: 'If dummy fails, try turning it off and on again.',
        url: 'https://dummy.com/docs/2',
      },
    ];

    for (const extDoc of externalDocs) {
      log(`Processing doc ${extDoc.id}`);
      const existingSync = await SyncedObject.findOne({
        tenantId: connection.tenantId,
        provider: this.name,
        externalId: extDoc.id,
        type: 'doc',
      });

      if (existingSync) {
        continue;
      }

      try {
        log(`Creating SyncedObject for doc ${extDoc.id}`);

        await SyncedObject.create({
          tenantId: connection.tenantId,
          integrationConnectionId: connection._id,
          provider: this.name,
          externalId: extDoc.id,
          type: 'doc',
          lastSyncedAt: new Date(),
          metadata: { url: extDoc.url, title: extDoc.title },
        });

        log(`Upserting RAG doc ${extDoc.id}`);
        await ragService.upsertDoc(
          connection.tenantId,
          'integration',
          `doc_${extDoc.id}`, // sourceId
          `${extDoc.title}\n${extDoc.content}`,
          { type: 'doc', provider: 'dummy', url: extDoc.url },
        );
        log(`Upserted RAG doc for doc ${extDoc.id}`);
      } catch (err) {
        logger.error(`Error syncing doc ${extDoc.id}:`, err);
      }
    }

    log('Sync finished');
  }
}
