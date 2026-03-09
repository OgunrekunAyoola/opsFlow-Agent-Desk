import { z } from 'zod';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodType<any>;
  execute: (
    args: any,
    context: { tenantId: string; userId?: string; ticketId?: string },
  ) => Promise<any>;
}

export const tools: Record<string, ToolDefinition> = {
  escalate_ticket: {
    name: 'escalate_ticket',
    description: 'Escalate the current ticket to high priority and add an internal note.',
    schema: z.object({
      reason: z.string().describe('The reason for escalation'),
    }),
    execute: async ({ reason }, { tenantId, ticketId, userId }) => {
      if (!ticketId || !tenantId) {
        throw new Error('Missing ticketId or tenantId context for escalation');
      }

      console.log(`[Action] Escalating ticket ${ticketId}`);

      // 1. Update Ticket Priority
      await Ticket.updateOne(
        { _id: ticketId, tenantId },
        { priority: 'urgent', status: 'triaged' },
      );

      // 2. Add Internal Note
      await TicketReply.create({
        tenantId,
        ticketId,
        authorType: 'ai',
        authorId: userId ? userId : undefined,
        body: `[Escalation] Ticket escalated by AI.\nReason: ${reason}`,
        isInternalNote: true,
        type: 'note',
      });

      return { success: true, message: 'Ticket escalated to high priority' };
    },
  },
  check_order_status: {
    name: 'check_order_status',
    description: 'Check the status of a customer order by Order ID',
    schema: z.object({
      orderId: z.string().describe('The order ID (e.g., ORD-123)'),
    }),
    execute: async ({ orderId }) => {
      // Mock Integration
      if (orderId === 'ORD-FAIL') return { status: 'failed', reason: 'Payment declined' };
      return { status: 'shipped', tracking: 'UPS-999999' };
    },
  },
  refund_order: {
    name: 'refund_order',
    description: 'Refund a customer order. Use with caution.',
    schema: z.object({
      orderId: z.string(),
      reason: z.string(),
    }),
    execute: async ({ orderId, reason }) => {
      console.log(`[Action] Refunding ${orderId} because: ${reason}`);
      return { success: true, refundId: 'REF-777' };
    },
  },
  reset_password: {
    name: 'reset_password',
    description: 'Trigger a password reset email for a user',
    schema: z.object({
      email: z.string().email(),
    }),
    execute: async ({ email }) => {
      console.log(`[Action] Password reset for ${email}`);
      return { success: true, message: 'Reset link sent' };
    },
  },
};

export class ActionService {
  getTools() {
    return Object.values(tools).map((t) => ({
      name: t.name,
      description: t.description,
      parameters: {
        type: 'OBJECT',
        properties: {
          orderId: { type: 'STRING' },
          reason: { type: 'STRING' },
          email: { type: 'STRING' },
        },
        required: [], // Simplified for prototype
      },
    }));
  }

  async executeTool(
    name: string,
    args: any,
    context: { tenantId: string; userId?: string; ticketId?: string },
  ) {
    const tool = tools[name];
    if (!tool) throw new Error(`Tool ${name} not found`);
    return tool.execute(args, context);
  }
}
