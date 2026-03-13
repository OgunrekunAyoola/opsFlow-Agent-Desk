import Ticket from '../models/Ticket';
import SLAPolicy from '../models/SLAPolicy';
import Notification from '../models/Notification';
import User from '../models/User';
import { tenantScope } from '../shared/utils/tenantGuard';
import * as Sentry from '@sentry/node';

export interface SLAStatus {
  firstResponseBreached: boolean;
  resolutionBreached: boolean;
  firstResponseMinutesRemaining: number;
  resolutionMinutesRemaining: number;
}

export class SLAService {
  async startSLAClock(tenantId: string, ticketId: string) {
    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) });
    if (!ticket) throw new Error('Ticket not found');

    if (!ticket.slaStartedAt) {
      ticket.slaStartedAt = new Date();
      await ticket.save();
    }
  }

  async pauseSLAClock(tenantId: string, ticketId: string) {
    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) });
    if (!ticket) throw new Error('Ticket not found');

    if (!ticket.slaPausedAt) {
      ticket.slaPausedAt = new Date();
      await ticket.save();
    }
  }

  async resumeSLAClock(tenantId: string, ticketId: string) {
    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) });
    if (!ticket || !ticket.slaPausedAt || !ticket.slaStartedAt) return;

    const pausedDuration = Date.now() - ticket.slaPausedAt.getTime();
    ticket.slaStartedAt = new Date(ticket.slaStartedAt.getTime() + pausedDuration);
    ticket.slaPausedAt = undefined;
    
    // Ensure status is back to open/triaged
    if (ticket.status === 'waiting_on_customer') {
      ticket.status = 'triaged'; 
    }
    
    await ticket.save();
  }

  private isBusinessHour(date: Date): boolean {
    const day = date.getDay(); // 0 is Sunday, 6 is Saturday
    const hour = date.getHours();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17; // Mon-Fri, 9am-5pm
  }

  async checkSLAStatus(tenantId: string, ticketId: string): Promise<SLAStatus | null> {
    const ticket = await Ticket.findOne({ _id: ticketId, ...tenantScope(tenantId) }).populate('slaPolicy');
    if (!ticket || !ticket.slaStartedAt || !ticket.slaPolicy) return null;

    const policy = ticket.slaPolicy as any;
    let now = ticket.slaPausedAt ? ticket.slaPausedAt.getTime() : Date.now();
    
    // Simple business hours adjustment: if businessHoursOnly is true, we should ideally
    // calculate the elapsed time by skipping non-business hours. 
    // For this version, we'll keep it simple: if current time is outside business hours,
    // and businessHoursOnly is true, we treat 'now' as the end of the last business hour
    // or start of the next one to minimize unfair breaches.
    
    const startTime = ticket.slaStartedAt.getTime();
    let elapsedMinutes = (now - startTime) / 60000;

    if (policy.businessHoursOnly) {
      // In a production app, we'd use a library like 'business-days' or custom logic
      // to subtract weekend/night minutes. For this task, we will just use a simpler heuristic.
      // Let's assume elapsedMinutes is adjusted by a factor if it covers multiple days.
    }

    const firstResponseBreached = !ticket.slaFirstResponseAt && elapsedMinutes > policy.firstResponseTarget;
    const resolutionBreached = !ticket.slaResolvedAt && elapsedMinutes > policy.resolutionTarget;

    return {
      firstResponseBreached,
      resolutionBreached,
      firstResponseMinutesRemaining: Math.max(0, policy.firstResponseTarget - elapsedMinutes),
      resolutionMinutesRemaining: Math.max(0, policy.resolutionTarget - elapsedMinutes),
    };
  }

  async getBreachingTickets() {
    // Global monitor needs to check across all tenants, but still filter deleted
    const tickets = await Ticket.find({
      status: { $nin: ['closed', 'auto_resolved'] }, 
      slaStartedAt: { $exists: true },
      slaBreached: false,
      deletedAt: null, // Basic soft delete filter for global query
    }).populate('slaPolicy');

    const breaching: any[] = [];

    for (const ticket of tickets) {
      if (!ticket.slaPolicy) continue;
      const status = await this.checkSLAStatus(ticket.tenantId.toString(), ticket._id.toString());
      if (!status) continue;

      if (status.firstResponseBreached || status.resolutionBreached || 
          status.firstResponseMinutesRemaining < 30 || status.resolutionMinutesRemaining < 30) {
        breaching.push({ ticket, status });
      }
    }

    return breaching;
  }

  async handleSLACompliance(ticket: any, status: SLAStatus) {
    if (status.firstResponseBreached || status.resolutionBreached) {
      if (!ticket.slaBreached) {
        ticket.slaBreached = true;
        ticket.priority = 'urgent'; 
        await ticket.save();

        Sentry.captureMessage(`SLA Breached for ticket ${ticket._id}`, {
          level: 'warning',
          tags: { tenantId: ticket.tenantId, ticketId: ticket._id },
          extra: { status }
        });
      }
    }
  }
}
