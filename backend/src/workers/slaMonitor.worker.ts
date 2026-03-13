import { Worker, Job } from 'bullmq';
import { buildConnection } from '../queue';
import { SLAService } from '../services/SLAService';
import Notification from '../models/Notification';
import User from '../models/User';
import TicketReply from '../models/TicketReply';
import { tenantScope } from '../shared/utils/tenantGuard';
import logger from '../shared/utils/logger';

const slaService = new SLAService();

export const slaMonitorWorker = new Worker(
  'sla-monitor',
  async (job: Job) => {
    logger.info(`[SLAGlobalMonitor] Running SLA check...`);
    const breachingData = await slaService.getBreachingTickets();

    for (const { ticket, status } of breachingData) {
      const { tenantId, assigneeId, subject, _id } = ticket;
      
      // Determine if it's already breached or just approaching
      const isBreached = status.firstResponseBreached || status.resolutionBreached;
      
      if (isBreached) {
        // Handle Breach: Escalate and Log
        await slaService.handleSLACompliance(ticket, status);

        // Add Internal Note about breach
        await TicketReply.create({
          tenantId,
          ticketId: _id,
          authorType: 'ai',
          body: `[SLA BREACH ALERT] This ticket has breached its SLA targets. Priority escalated to Urgent.`,
          isInternalNote: true,
          type: 'note',
        });

        // Notify Assignee and Team Manager (finding an admin for now as 'manager')
        const notifyIds: string[] = [];
        if (assigneeId) notifyIds.push(assigneeId.toString());
        
        const admins = await User.find({ ...tenantScope(tenantId), role: 'admin' }).select('_id');
        admins.forEach(admin => {
          if (!notifyIds.includes(admin._id.toString())) {
            notifyIds.push(admin._id.toString());
          }
        });

        await Notification.insertMany(notifyIds.map(userId => ({
          tenantId,
          userId,
          type: 'sla_breach',
          message: `SLA BREACHED: Ticket "${subject}" has exceeded target times.`,
          url: `/tickets/${_id}`,
        })));

      } else {
        // Approaching breach (within 30m)
        if (assigneeId) {
          await Notification.create({
            tenantId,
            userId: assigneeId,
            type: 'sla_approaching_breach',
            message: `SLA Warning: Ticket "${subject}" is within 30 minutes of breach.`,
            url: `/tickets/${_id}`,
          });
        }
      }
    }
  },
  { connection: buildConnection() }
);
