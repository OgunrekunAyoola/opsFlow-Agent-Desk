import jwt from 'jsonwebtoken';
import { EmailService } from './EmailService';
import Tenant from '../models/Tenant';

const frontendBaseUrl = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export class NotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  private async getTenantInfo(tenantId: string) {
    return Tenant.findOne({ _id: tenantId, deletedAt: null });
  }

  private generatePortalLink(ticketId: string, tenantId: string, customerEmail: string) {
    const token = jwt.sign({ ticketId, customerEmail, tenantId }, JWT_SECRET, { expiresIn: '14d' });
    return `${frontendBaseUrl}/portal?token=${token}`;
  }

  private buildTemplate(tenantName: string, title: string, contentHtml: string, actionUrl?: string, actionText?: string) {
    // Dark header, white body
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">${tenantName}</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">${title}</h2>
          <div style="color: #334155; line-height: 1.6; font-size: 15px;">
            ${contentHtml}
          </div>
          ${actionUrl ? `
            <div style="margin-top: 32px; text-align: center;">
              <a href="${actionUrl}" style="background-color: #06b6d4; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                ${actionText || 'View Details'}
              </a>
            </div>
          ` : ''}
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          Powered by OpsFlowAI Support
        </div>
      </div>
    `;
  }

  async sendTicketCreated(tenantId: string, ticket: any) {
    if (!ticket.customerEmail) return;
    const tenant = await this.getTenantInfo(tenantId);
    if (!tenant) return;

    const portalUrl = this.generatePortalLink(ticket._id.toString(), tenantId, ticket.customerEmail);
    const content = `
      <p>Hi ${ticket.customerName || 'there'},</p>
      <p>We've received your request: <strong>"${ticket.subject}"</strong></p>
      <p>We are looking into it and will get back to you shortly. You can track the status of your ticket via the portal below.</p>
    `;

    const html = this.buildTemplate(tenant.name || 'Support', 'Ticket Received', content, portalUrl, 'View Ticket');
    await this.emailService.send({
      to: ticket.customerEmail,
      subject: `[Ticket #${ticket._id.toString().slice(-6)}] We received your request`,
      html,
    });
  }

  async sendTicketAssigned(tenantId: string, agent: any, ticket: any) {
    if (!agent.email) return;
    const tenant = await this.getTenantInfo(tenantId);
    if (!tenant) return;

    const ticketUrl = `${frontendBaseUrl}/tickets/${ticket._id.toString()}`;
    const content = `
      <p>Hi ${agent.name},</p>
      <p>You have been assigned to ticket <strong>#${ticket._id.toString().slice(-6)}</strong>.</p>
      <p><strong>Subject:</strong> ${ticket.subject}</p>
    `;

    const html = this.buildTemplate(tenant.name || 'OpsFlowAI', 'Ticket Assigned', content, ticketUrl, 'Open in OpsFlow');
    await this.emailService.send({
      to: agent.email,
      subject: `You've been assigned ticket #${ticket._id.toString().slice(-6)}`,
      html,
    });
  }

  async sendAgentReply(tenantId: string, ticket: any, replyBody: string, isAutoReply: boolean = false) {
    if (!ticket.customerEmail) return;
    const tenant = await this.getTenantInfo(tenantId);
    if (!tenant) return;

    const portalUrl = this.generatePortalLink(ticket._id.toString(), tenantId, ticket.customerEmail);
    const content = `
      <p>Hi ${ticket.customerName || 'there'},</p>
      <p>There's an update on your ticket: <strong>"${ticket.subject}"</strong></p>
      <blockquote style="border-left: 4px solid #e2e8f0; padding-left: 16px; margin: 24px 0; color: #475569; white-space: pre-wrap;">
        ${replyBody}
      </blockquote>
      ${isAutoReply ? '<p style="font-size: 12px; color: #64748b;"><em>This is an automated reply.</em></p>' : ''}
    `;

    const html = this.buildTemplate(tenant.name || 'Support', 'New Reply', content, portalUrl, 'Reply in Portal');
    await this.emailService.send({
      to: ticket.customerEmail,
      subject: `Re: ${ticket.subject} [Ticket #${ticket._id.toString().slice(-6)}]`,
      html,
    });
  }

  async sendTicketResolved(tenantId: string, ticket: any) {
    if (!ticket.customerEmail) return;
    const tenant = await this.getTenantInfo(tenantId);
    if (!tenant) return;

    const portalUrl = this.generatePortalLink(ticket._id.toString(), tenantId, ticket.customerEmail);
    const csatToken = jwt.sign({ ticketId: ticket._id.toString(), tenantId }, JWT_SECRET, { expiresIn: '7d' });
    const surveyUrl = `${frontendBaseUrl}/csat/${csatToken}`; // Legacy link or portal link

    const content = `
      <p>Hi ${ticket.customerName || 'there'},</p>
      <p>Your ticket <strong>"${ticket.subject}"</strong> has been resolved and closed.</p>
      <p>If you still need help, you can reopen it by replying.</p>
      <br/>
      <h3 style="margin: 0 0 12px 0;">How did we do?</h3>
      <div style="display: flex; gap: 8px;">
        ${[1,2,3,4,5].map(score => `<a href="${portalUrl}" style="background: #0ea5e9; color: white; border-radius: 4px; padding: 8px 16px; text-decoration: none; font-weight: bold;">${score}</a>`).join('')}
      </div>
    `;

    const html = this.buildTemplate(tenant.name || 'Support', 'Ticket Resolved', content, portalUrl, 'View Ticket');
    await this.emailService.send({
      to: ticket.customerEmail,
      subject: `Resolved: ${ticket.subject} [Ticket #${ticket._id.toString().slice(-6)}]`,
      html,
    });
  }

  async sendTicketAutoClosed(tenantId: string, ticket: any) {
    if (!ticket.customerEmail) return;
    const tenant = await this.getTenantInfo(tenantId);
    if (!tenant) return;

    const portalUrl = this.generatePortalLink(ticket._id.toString(), tenantId, ticket.customerEmail);
    const content = `
      <p>Hi ${ticket.customerName || 'there'},</p>
      <p>We haven't heard from you in a while regarding ticket <strong>"${ticket.subject}"</strong>, so we've gone ahead and closed it.</p>
      <p>If you're still experiencing issues, you can reopen it by replying.</p>
    `;

    const html = this.buildTemplate(tenant.name || 'Support', 'Ticket Auto-Closed', content, portalUrl, 'View Ticket');
    await this.emailService.send({
      to: ticket.customerEmail,
      subject: `Closed: ${ticket.subject} [Ticket #${ticket._id.toString().slice(-6)}]`,
      html,
    });
  }

  async sendTicketFollowUp(tenantId: string, ticket: any) {
    if (!ticket.customerEmail) return;
    const tenant = await this.getTenantInfo(tenantId);
    if (!tenant) return;

    const portalUrl = this.generatePortalLink(ticket._id.toString(), tenantId, ticket.customerEmail);
    const content = `
      <p>Hi ${ticket.customerName || 'there'},</p>
      <p>We're just checking in on your ticket <strong>"${ticket.subject}"</strong> as we haven't heard back.</p>
      <p>Is there anything else you need help with? This ticket will automatically close in 4 days if we don't hear from you.</p>
    `;

    const html = this.buildTemplate(tenant.name || 'Support', 'Checking in', content, portalUrl, 'Reply in Portal');
    await this.emailService.send({
      to: ticket.customerEmail,
      subject: `Checking in: [Ticket #${ticket._id.toString().slice(-6)}]`,
      html,
    });
  }
}
