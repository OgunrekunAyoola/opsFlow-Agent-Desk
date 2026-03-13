import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from './shared/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export let io: SocketIOServer;

export function initSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // In production, restrict this to your frontend URL
      methods: ['GET', 'POST'],
    },
  });

    io.on('connection', (socket) => {
    logger.info(`[Socket] New connection: ${socket.id}`);

    socket.on('ticket:viewing', (data: { ticketId: string; userId: string; userName: string }) => {
      const { ticketId, userId, userName } = data;
      socket.join(`ticket:${ticketId}`);
      logger.info(`[Socket] User ${userId} (${userName}) viewing ticket: ${ticketId}`);
      
      // Broadcast to others in the same room
      socket.to(`ticket:${ticketId}`).emit('ticket:viewing', { userId, userName, ticketId });
    });

    socket.on('ticket:typing', (data: { ticketId: string; userId: string; userName: string }) => {
      socket.to(`ticket:${data.ticketId}`).emit('ticket:typing', data);
    });

    socket.on('ticket:stop_typing', (data: { ticketId: string; userId: string }) => {
      socket.to(`ticket:${data.ticketId}`).emit('ticket:stop_typing', data);
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket] Disconnected: ${socket.id}`);
    });
  });

  return io;
}
