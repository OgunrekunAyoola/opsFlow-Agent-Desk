import { Worker, Job } from 'bullmq';
import { buildConnection } from '../queue';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';
import { NotificationService } from '../services/NotificationService';
import logger from '../shared/utils/logger';

export const lifecycleWorker = new Worker(
  'ticket-lifecycle',
  async (job: Job) => {
    logger.info(`[LifecycleWorker] Running check...`);
    
    // 1. Task 3.1: 72h Follow-up
    const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const waitingTickets = await Ticket.find({
      status: 'waiting_on_customer',
      updatedAt: { $lt: threeDaysAgo },
      followUpSent: { $ne: true },
    });

    for (const ticket of waitingTickets) {
      if (ticket.customerEmail) {
        const notificationService = new NotificationService();
        await notificationService.sendTicketFollowUp(ticket.tenantId.toString(), ticket);
        ticket.followUpSent = true;
        await ticket.save();

        // Log follow-up event
        await TicketReply.create({
          tenantId: ticket.tenantId,
          ticketId: ticket._id,
          authorType: 'ai',
          body: `[Automated] 72-hour follow-up email sent to customer.`,
          isInternalNote: true,
          type: 'internal_note',
        });
      }
    }

    // 2. Task 3.2: 7d Auto-close
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const inactiveTickets = await Ticket.find({
      status: 'waiting_on_customer',
      updatedAt: { $lt: sevenDaysAgo },
    });

    for (const ticket of inactiveTickets) {
      ticket.status = 'closed';
      await ticket.save();

      const notificationService = new NotificationService();
      await notificationService.sendTicketAutoClosed(ticket.tenantId.toString(), ticket);

      // Log auto-close event
      await TicketReply.create({
        tenantId: ticket.tenantId,
        ticketId: ticket._id,
        authorType: 'ai',
        body: `We're closing this ticket as we haven't heard back. Reply to reopen anytime.`,
        isInternalNote: false,
        type: 'public_reply',
      });

      await TicketReply.create({
        tenantId: ticket.tenantId,
        ticketId: ticket._id,
        authorType: 'ai',
        body: `[Automated] Ticket auto-closed after 7 days of inactivity.`,
        isInternalNote: true,
        type: 'internal_note',
      });

      logger.info(`[LifecycleWorker] Auto-closed ticket ${ticket._id}`);
    }
  },
  { connection: buildConnection() }
);
