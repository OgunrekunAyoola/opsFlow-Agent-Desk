import mongoose from 'mongoose';
import dotenv from 'dotenv';
import assert from 'assert';
import Ticket from '../models/Ticket';
import Tenant from '../models/Tenant';
import { tenantScope } from '../shared/utils/tenantGuard';
import { TicketService } from '../services/TicketService';

dotenv.config();

async function runIsolationTests() {
  console.log('\n--- Running Tenant Isolation & Soft Delete Tests ---');

  const mongoUri = process.env.MONGO_URI || process.env.TEST_DB_URI || 'mongodb://127.0.0.1:27017/opsflow_test';
  
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('Connected to Test DB');
    }
  } catch (err) {
    console.error('❌ DB Connection Failed:', err);
    process.exit(1);
  }

  const ticketService = new TicketService();
  let tenantAId: string = '';
  let tenantBId: string = '';
  let ticketAId: string = '';

  try {
    // 1. Setup Tenants
    console.log('Creating Test Tenants...');
    const tenantA = await Tenant.create({ name: 'Tenant A', slug: 'tenant-a', tier: 'growth' });
    const tenantB = await Tenant.create({ name: 'Tenant B', slug: 'tenant-b', tier: 'starter' });
    tenantAId = tenantA._id.toString();
    tenantBId = tenantB._id.toString();

    // 2. Create Data for Tenant A
    console.log('Creating Data for Tenant A...');
    const ticketA = await Ticket.create({
      tenantId: tenantA._id,
      subject: 'Secret Ticket A',
      body: 'Sensitive content',
      customerEmail: 'customer@a.com',
      channel: 'email',
      status: 'new',
      priority: 'medium',
      category: 'general',
      isAiTriaged: false,
      slaBreached: false
    });
    ticketAId = ticketA._id.toString();

    // 3. Test Isolation: Tenant B should NOT see Tenant A's data
    console.log('Testing Isolation...');
    const bTickets = await Ticket.find({ ...tenantScope(tenantBId) }).exec();
    assert.strictEqual(bTickets.length, 0, 'Tenant B seen Tenant A data!');
    
    const bTicketById = await Ticket.findOne({ _id: ticketAId, ...tenantScope(tenantBId) }).exec();
    assert.strictEqual(bTicketById, null, 'Tenant B accessed Tenant A ticket by ID!');

    // 4. Test Access: Tenant A should see their own data
    console.log('Testing Authorized Access...');
    const aTickets = await Ticket.find({ ...tenantScope(tenantAId) }).exec();
    assert.strictEqual(aTickets.length, 1, 'Tenant A cannot see their own data');
    assert.strictEqual(aTickets[0].subject, 'Secret Ticket A');

    // 5. Test Soft Delete
    console.log('Testing Soft Delete...');
    // We'll use TicketService if it has a delete method, otherwise direct update
    // Looking at TicketService, it doesn't have a direct 'delete' method in the viewed snippet, 
    // but routes use findOneAndUpdate or findOneAndDelete (which we changed to update).
    
    await Ticket.findOneAndUpdate(
      { _id: ticketAId, ...tenantScope(tenantAId) },
      { deletedAt: new Date() }
    ).exec();

    const aTicketsAfterDelete = await Ticket.find({ ...tenantScope(tenantAId) }).exec();
    assert.strictEqual(aTicketsAfterDelete.length, 0, 'Soft deleted ticket still returned by tenantScope');

    const rawTicket = await Ticket.findById(ticketAId).exec();
    assert(rawTicket, 'Ticket was HARD deleted!');
    assert(rawTicket.deletedAt, 'deletedAt flag was NOT set');

    console.log('✅ Tenant Isolation & Soft Delete Tests PASSED');
  } catch (error) {
    console.error('❌ Test FAILED:', error);
    process.exit(1);
  } finally {
    console.log('Cleaning up...');
    if (tenantAId) await Tenant.deleteOne({ _id: tenantAId });
    if (tenantBId) await Tenant.deleteOne({ _id: tenantBId });
    if (ticketAId) await Ticket.deleteOne({ _id: ticketAId });
    await mongoose.disconnect();
  }
}

runIsolationTests();
