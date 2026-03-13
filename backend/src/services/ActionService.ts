import { z } from 'zod';
import crypto from 'crypto';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';
import Order from '../models/Order';
import User from '../models/User';
import { tenantScope } from '../shared/utils/tenantGuard';
import { EmailService } from './EmailService';
import logger from '../shared/utils/logger';

export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodType<Record<string, unknown>>;
  execute: (
    args: Record<string, unknown> | unknown,
    context: { tenantId: string; userId?: string; ticketId?: string },
  ) => Promise<Record<string, unknown>>;
}

export const tools: Record<string, ToolDefinition> = {
  escalate_ticket: {
    name: 'escalate_ticket',
    description: 'Escalate the current ticket to high priority and add an internal note.',
    schema: z.object({
      reason: z.string().describe('The reason for escalation'),
    }),
    execute: async (args: unknown, { tenantId, ticketId, userId }) => {
      const { reason } = args as { reason: string };
      if (!ticketId || !tenantId) {
        throw new Error('Missing ticketId or tenantId context for escalation');
      }

      logger.info(`[Action] Escalating ticket ${ticketId}`);

      // 1. Update Ticket Priority
      await Ticket.updateOne(
        { _id: ticketId, ...tenantScope(tenantId) },
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
    execute: async (args: unknown, { tenantId }) => {
      const { orderId } = args as { orderId: string };
      const order = await Order.findOne({ orderId, ...tenantScope(tenantId) }).exec();
      if (!order) return { status: 'not_found', reason: 'Order not found' };
      return { status: order.status, tracking: order.trackingNumber, total: order.total };
    },
  },
  refund_order: {
    name: 'refund_order',
    description: 'Refund a customer order. Use with caution.',
    schema: z.object({
      orderId: z.string(),
      reason: z.string(),
    }),
    execute: async (args: unknown, { tenantId }) => {
      const { orderId, reason } = args as { orderId: string; reason: string };
      const order = await Order.findOne({ orderId, ...tenantScope(tenantId) }).exec();
      if (!order) return { success: false, reason: 'Order not found' };
      if (order.status === 'refunded') return { success: false, reason: 'Already refunded' };
      
      const refundId = `REF-${Math.floor(Math.random() * 1000000)}`;
      order.status = 'refunded';
      order.refundId = refundId;
      order.refundReason = reason;
      await order.save();
      
      logger.info(`[Action] Refunding ${orderId} because: ${reason}`);
      return { success: true, refundId };
    },
  },
  reset_password: {
    name: 'reset_password',
    description: 'Trigger a password reset email for a user',
    schema: z.object({
      email: z.string().email(),
    }),
    execute: async (args: unknown, { tenantId }) => {
      const { email } = args as { email: string };
      const user = await User.findOne({ email, ...tenantScope(tenantId) }).exec();
      if (!user) return { success: false, message: 'User not found' };
      
      const token = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();
      
      const emailService = new EmailService();
      await emailService.send({
        to: email,
        subject: 'Password Reset Request',
        text: `Your password reset token is: ${token}`,
        html: `<p>Your password reset token is: <strong>${token}</strong></p>`
      }).catch(() => logger.error('Failed to send reset email'));
      
      return { success: true, message: 'Reset link sent' };
    },
  },
};

export class ActionService {
  getTools() {
    return Object.keys(tools).map((key) => {
      const t = tools[key];
      return {
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
        }
      };
    });
  }

  async executeTool(
    name: string,
    args: Record<string, unknown> | unknown,
    context: { tenantId: string; userId?: string; ticketId?: string },
  ) {
    const tool = tools[name];
    if (!tool) throw new Error(`Tool ${name} not found`);
    return tool.execute(args, context);
  }
}
