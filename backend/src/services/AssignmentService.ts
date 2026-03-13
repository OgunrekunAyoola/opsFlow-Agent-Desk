import mongoose from 'mongoose';
import Ticket from '../models/Ticket';
import User from '../models/User';
import Notification from '../models/Notification';
import { SLAService } from './SLAService';
import { tenantScope } from '../shared/utils/tenantGuard';
import logger from '../shared/utils/logger';

export class AssignmentService {
  private slaService: SLAService;

  constructor() {
    this.slaService = new SLAService();
  }

  async getAgentWorkload(tenantId: string) {
    const scope = tenantScope(tenantId);
    const agents = await User.find({ ...scope, role: { $in: ['admin', 'member'] } }).lean();
    
    const workloads = await Promise.all(
      agents.map(async (agent) => {
        const count = await Ticket.countDocuments({
          ...scope,
          assigneeId: agent._id,
          status: { $nin: ['closed', 'resolved', 'auto_resolved'] },
        });
        return { agent, count };
      })
    );

    return workloads;
  }

  async getAvailableAgents(tenantId: string, category?: string) {
    const scope = tenantScope(tenantId);
    let query: any = { ...scope, role: { $in: ['admin', 'member'] } };
    
    if (category === 'billing') {
      // Logic for teams would go here
    }

    return User.find(query);
  }

  async assignTicket(ticketId: string, category?: string) {
    const ticket = await Ticket.findOne({ _id: ticketId, deletedAt: null });
    if (!ticket) throw new Error('Ticket not found');

    const tenantIdStr = ticket.tenantId.toString();
    const agents = await this.getAvailableAgents(tenantIdStr, category);
    
    if (agents.length === 0) {
      const fallbackAgents = await this.getAvailableAgents(tenantIdStr);
      if (fallbackAgents.length === 0) return;
    }

    const workloads = await this.getAgentWorkload(tenantIdStr);
    
    const availableWorkloads = workloads.filter(w => 
      agents.some(a => a._id.toString() === w.agent._id.toString())
    );

    if (availableWorkloads.length === 0) return;

    availableWorkloads.sort((a, b) => a.count - b.count);
    const selectedAgent = availableWorkloads[0].agent;

    ticket.assigneeId = selectedAgent._id as any;
    if (['new', 'triaging'].includes(ticket.status)) {
      ticket.status = 'triaged';
    }
    
    await ticket.save();

    // Trigger SLA Clock Start
    await this.slaService.startSLAClock(tenantIdStr, ticketId);

    // Send assignment notification
    await Notification.create({
      tenantId: ticket.tenantId,
      userId: selectedAgent._id,
      type: 'ticket_assigned',
      message: `You have been assigned a new ticket: "${ticket.subject}"`,
      url: `/tickets/${ticket._id}`,
    });

    logger.info(`[Assignment] Ticket ${ticketId} assigned to ${selectedAgent.email} (Workload: ${availableWorkloads[0].count})`);
    
    return selectedAgent;
  }
}
