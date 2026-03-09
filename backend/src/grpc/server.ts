import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import logger from '../utils/logger';
import Ticket from '../models/Ticket';
import mongoose from 'mongoose';
import { TicketTriageWorkflow } from '../services/TicketTriageWorkflow';
import { RAGService } from '../services/RAGService';

const PROTO_PATH = path.resolve(__dirname, '../proto/ticket.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const ticketProto = grpc.loadPackageDefinition(packageDefinition).ticket as any;

const getRequestId = (call: any): string => {
  const metadata = call.metadata.getMap();
  return (metadata['x-request-id'] as string) || 'unknown';
};

const mapTicketToProto = (ticket: any) => ({
  id: ticket._id.toString(),
  subject: ticket.subject,
  status: ticket.status,
  priority: ticket.priority,
  body: ticket.body,
  createdAt: ticket.createdAt.toISOString(),
  aiDraftText: ticket.aiDraft?.body || '',
  aiConfidence: ticket.aiDraft?.confidence || 0,
  aiSuggestedCategory: ticket.aiAnalysis?.suggestedCategory || '',
});

const getTicket = async (call: any, callback: any) => {
  const { id, tenantId } = call.request;
  const requestId = getRequestId(call);

  logger.info(`[gRPC] GetTicket called for ID: ${id}, Tenant: ${tenantId}`, { requestId });

  try {
    const ticket = await Ticket.findOne({ _id: id, tenantId });
    if (!ticket) {
      logger.warn(`[gRPC] Ticket not found: ${id}`, { requestId });
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Ticket not found',
      });
    }
    callback(null, mapTicketToProto(ticket));
  } catch (error: any) {
    logger.error(`[gRPC] GetTicket Error: ${error.message}`, { requestId, error });
    callback({
      code: grpc.status.INTERNAL,
      details: 'Internal Server Error',
    });
  }
};

const createTicket = async (call: any, callback: any) => {
  const { subject, body, tenantId } = call.request;
  const requestId = getRequestId(call);

  logger.info(`[gRPC] CreateTicket called: ${subject}`, { requestId });

  try {
    const ticket = await Ticket.create({
      subject,
      body,
      tenantId,
      status: 'new',
      priority: 'medium', // Default
    });

    logger.info(`[gRPC] Ticket created: ${ticket._id}`, { requestId });

    // Index the ticket for RAG asynchronously
    const ragService = new RAGService();
    ragService
      .upsertDoc(
        new mongoose.Types.ObjectId(tenantId),
        'ticket',
        ticket._id.toString(),
        `${subject}\n${body}`,
        { status: ticket.status, priority: ticket.priority },
      )
      .catch((err) => {
        logger.error(`[gRPC] Failed to index ticket: ${err.message}`, { requestId });
      });

    callback(null, mapTicketToProto(ticket));
  } catch (error: any) {
    logger.error(`[gRPC] CreateTicket Error: ${error.message}`, { requestId, error });
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to create ticket',
    });
  }
};

const listTickets = async (call: any, callback: any) => {
  const { tenantId, limit = 10, page = 1, status } = call.request;
  const requestId = getRequestId(call);

  logger.info(`[gRPC] ListTickets called for Tenant: ${tenantId}`, { requestId });

  try {
    const query: any = { tenantId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await Ticket.countDocuments(query);

    callback(null, {
      tickets: tickets.map(mapTicketToProto),
      total,
    });
  } catch (error: any) {
    logger.error(`[gRPC] ListTickets Error: ${error.message}`, { requestId, error });
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to list tickets',
    });
  }
};

const updateTicket = async (call: any, callback: any) => {
  const { id, tenantId, status, priority } = call.request;
  const requestId = getRequestId(call);

  logger.info(`[gRPC] UpdateTicket called: ID: ${id}`, { requestId });

  try {
    const updates: any = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    const ticket = await Ticket.findOneAndUpdate({ _id: id, tenantId }, updates, { new: true });

    if (!ticket) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Ticket not found',
      });
    }

    // Update RAG index with new metadata
    const ragService = new RAGService();
    ragService
      .upsertDoc(
        new mongoose.Types.ObjectId(tenantId),
        'ticket',
        ticket._id.toString(),
        `${ticket.subject}\n${ticket.body}`,
        { status: ticket.status, priority: ticket.priority },
      )
      .catch((err) => {
        logger.error(`[gRPC] Failed to update ticket index: ${err.message}`, { requestId });
      });

    callback(null, mapTicketToProto(ticket));
  } catch (error: any) {
    logger.error(`[gRPC] UpdateTicket Error: ${error.message}`, { requestId, error });
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to update ticket',
    });
  }
};

const triageTicket = async (call: any, callback: any) => {
  const { id, tenantId, userId } = call.request;
  const requestId = getRequestId(call);

  logger.info(`[gRPC] TriageTicket called: ID: ${id}`, { requestId });

  try {
    // Check if ticket exists first
    const ticket = await Ticket.findOne({ _id: id, tenantId });
    if (!ticket) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Ticket not found',
      });
    }

    // Trigger workflow asynchronously
    const workflow = new TicketTriageWorkflow();
    workflow
      .run({
        tenantId,
        ticketId: id,
        startedByUserId: userId,
      })
      .catch((err) => {
        logger.error(`[gRPC] Triage Workflow Failed Async: ${err.message}`, {
          requestId,
          error: err,
        });
      });

    // Update ticket status to indicate processing
    ticket.status = 'triaging';
    await ticket.save();

    callback(null, {
      id,
      status: 'triaging',
      message: 'Triage workflow started successfully',
    });
  } catch (error: any) {
    logger.error(`[gRPC] TriageTicket Error: ${error.message}`, { requestId, error });
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to start triage',
    });
  }
};

const searchTickets = async (call: any, callback: any) => {
  const { tenantId, query, limit = 5 } = call.request;
  const requestId = getRequestId(call);

  logger.info(`[gRPC] SearchTickets called: "${query}"`, { requestId });

  try {
    const ragService = new RAGService();
    let ticketIds: string[] = [];

    try {
      // Attempt vector search
      const results = await ragService.search(new mongoose.Types.ObjectId(tenantId), query, limit);
      ticketIds = results.filter((r) => r.sourceType === 'ticket').map((r) => r.sourceId);
    } catch (err: any) {
      logger.warn(
        `[gRPC] Vector search failed (likely no index), falling back to text search: ${err.message}`,
        { requestId },
      );
    }

    let tickets;
    if (ticketIds.length > 0) {
      // Fetch tickets by ID (preserving order if possible, but MongoDB $in doesn't guarantee order)
      // To preserve order, we map manually
      const foundTickets = await Ticket.find({ _id: { $in: ticketIds }, tenantId });
      const ticketMap = new Map(foundTickets.map((t) => [t._id.toString(), t]));
      tickets = ticketIds.map((id) => ticketMap.get(id)).filter((t) => t);
    } else {
      // Fallback to regex search on subject/body
      tickets = await Ticket.find({
        tenantId,
        $or: [
          { subject: { $regex: query, $options: 'i' } },
          { body: { $regex: query, $options: 'i' } },
        ],
      }).limit(limit);
    }

    callback(null, {
      tickets: tickets.map(mapTicketToProto),
      total: tickets.length,
    });
  } catch (error: any) {
    logger.error(`[gRPC] SearchTickets Error: ${error.message}`, { requestId, error });
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to search tickets',
    });
  }
};

import TicketReply from '../models/TicketReply';
import { emailSendQueue } from '../queue/index';

export const replyTicket = async (call: any, callback: any) => {
  const { id, tenantId, body, userId } = call.request;
  const requestId = getRequestId(call);

  logger.info(`[gRPC] ReplyTicket called: ID: ${id}`, { requestId });

  try {
    const ticket = await Ticket.findOne({ _id: id, tenantId });
    if (!ticket) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Ticket not found',
      });
    }

    // Create reply
    const reply = await TicketReply.create({
      tenantId,
      ticketId: id,
      authorType: 'human',
      authorId: userId,
      body,
    });

    // Send email (mock queue add)
    if (ticket.customerEmail) {
      await emailSendQueue.add('send', {
        replyId: reply._id.toString(),
        to: ticket.customerEmail,
        subject: `Re: ${ticket.subject}`,
        body: reply.body,
      });
    }

    // Update ticket status
    if (ticket.status !== 'closed') {
      ticket.status = 'replied';
      await ticket.save();
    }

    // Index the ticket update (if status changed)
    const ragService = new RAGService();
    ragService
      .upsertDoc(
        new mongoose.Types.ObjectId(tenantId),
        'ticket',
        ticket._id.toString(),
        `${ticket.subject}\n${ticket.body}`,
        { status: ticket.status, priority: ticket.priority },
      )
      .catch((err) => logger.warn('RAG update failed', err));

    callback(null, mapTicketToProto(ticket));
  } catch (error: any) {
    logger.error(`[gRPC] ReplyTicket Error: ${error.message}`, { requestId, error });
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to reply to ticket',
    });
  }
};

export const startGrpcServer = () => {
  const server = new grpc.Server();
  server.addService(ticketProto.TicketService.service, {
    GetTicket: getTicket,
    CreateTicket: createTicket,
    ListTickets: listTickets,
    UpdateTicket: updateTicket,
    TriageTicket: triageTicket,
    SearchTickets: searchTickets,
    ReplyTicket: replyTicket,
  });

  const port = process.env.GRPC_PORT || '50051';
  // Check for SSL certificates
  // In a real scenario, we would load certs here
  // For now, use insecure credentials as requested/default
  const credentials = grpc.ServerCredentials.createInsecure();

  server.bindAsync(`0.0.0.0:${port}`, credentials, (err, port) => {
    if (err) {
      logger.error('Failed to bind gRPC server', err);
      return;
    }
    logger.info(`gRPC Server running on port ${port}`);
    server.start();
  });
};
