import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../db';
import Ticket from '../models/Ticket';
import Tenant from '../models/Tenant';
import User from '../models/User';
import SLAPolicy from '../models/SLAPolicy';
import { TicketService } from '../services/TicketService';
import { SLAService } from '../services/SLAService';
import { AssignmentService } from '../services/AssignmentService';

async function verify() {
  await connectDB();
  console.log('Connected to DB');

  // 1. Setup Test Data
  let tenant = await Tenant.findOne({ name: 'Test Tenant' });
  if (!tenant) {
    tenant = await Tenant.create({ name: 'Test Tenant', domain: 'test.com' });
  }
  const tenantId = tenant._id.toString();

  let admin = await User.findOne({ tenantId, role: 'admin' });
  if (!admin) {
    admin = await User.create({ 
      tenantId, 
      name: 'Test Admin', 
      email: 'admin@test.com', 
      role: 'admin',
      passwordHash: 'hidden' 
    });
  }

  // Ensure default SLA policies exist
  const slaService = new SLAService();
  let starterPolicy = await SLAPolicy.findOne({ tenantId, tier: 'starter' });
  if (!starterPolicy) {
    starterPolicy = await SLAPolicy.create({
      tenantId,
      name: 'Starter SLA',
      tier: 'starter',
      firstResponseTarget: 480,
      resolutionTarget: 1440,
    });
  }

  const ticketService = new TicketService();
  const assignmentService = new AssignmentService();

  console.log('--- Step 1: Create Ticket (via API/Webhook Simulation) ---');
  const ticket = await ticketService.createTicket({
    tenantId,
    userId: admin._id.toString(),
    data: {
      subject: 'Urgent: My order is delayed',
      body: 'I ordered 3 days ago and still no update.',
      customerName: 'Alice Customer',
      customerEmail: 'alice@example.com',
      priority: 'high'
    }
  });
  console.log(`Ticket Created: ${ticket?._id}, Status: ${ticket?.status}, SLA Policy: ${ticket?.slaPolicy}`);

  console.log('--- Step 2: Auto-Assignment ---');
  // Manual trigger since we're in a script
  const assignedAgent = await assignmentService.assignTicket(ticket!._id.toString());
  const updatedTicket = await Ticket.findById(ticket!._id);
  console.log(`Assigned Agent: ${assignedAgent?.email}, New Status: ${updatedTicket?.status}, SLA Started: ${updatedTicket?.slaStartedAt}`);

  console.log('--- Step 3: Add Internal Note (SLA should NOT pause) ---');
  await ticketService.addReply({
    tenantId,
    userId: admin._id.toString(),
    ticketId: ticket!._id.toString(),
    data: { body: 'Checking order details in the system...', type: 'note' }
  });
  const t3 = await Ticket.findById(ticket!._id);
  console.log(`After Note - Status: ${t3?.status}, SLA Paused: ${!!t3?.slaPausedAt}`);

  console.log('--- Step 4: Add Public Reply (SLA SHOULD pause) ---');
  await ticketService.addReply({
    tenantId,
    userId: admin._id.toString(),
    ticketId: ticket!._id.toString(),
    data: { body: 'Hi Alice, I am looking into your order #123. It should ship tomorrow.', type: 'reply' }
  });
  const t4 = await Ticket.findById(ticket!._id);
  console.log(`After Reply - Status: ${t4?.status}, SLA Paused at: ${t4?.slaPausedAt}`);

  console.log('--- Step 5: Customer Reply (Reopen Logic) ---');
  // Simulation of inbound email reply
  await ticketService.handleInboundReply(tenantId, t4!, 'alice@example.com', 'Thanks! Can you confirm the address?');
  const t5 = await Ticket.findById(ticket!._id);
  console.log(`After Customer Reply - Status: ${t5?.status}, SLA Resumed (PausedAt cleared): ${!t5?.slaPausedAt}`);

  console.log('--- Step 6: Close Ticket (CSAT Trigger) ---');
  await ticketService.updateTicket(tenantId, ticket!._id.toString(), { status: 'closed' });
  const t6 = await Ticket.findById(ticket!._id);
  console.log(`Ticket Closed - Status: ${t6?.status}`);

  console.log('--- Verification Complete ---');
  await mongoose.disconnect();
  process.exit(0);
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
