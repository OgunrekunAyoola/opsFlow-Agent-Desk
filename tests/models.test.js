const mongoose = require('./../backend/node_modules/mongoose');

const Tenant = require('../backend/dist/models/Tenant').default;
const User = require('../backend/dist/models/User').default;
const Ticket = require('../backend/dist/models/Ticket').default;
const TicketReply = require('../backend/dist/models/TicketReply').default;
const Client = require('../backend/dist/models/Client').default;
const WorkflowRun = require('../backend/dist/models/WorkflowRun').default;
const WorkflowStep = require('../backend/dist/models/WorkflowStep').default;

async function run() {
  console.log('Models Test');
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/opsflow';
  await mongoose.connect(uri);

  const tenant = await Tenant.create({ name: 'Model Corp' });
  const user = await User.create({
    tenantId: tenant._id,
    name: 'Model Admin',
    email: `model-${Date.now()}@test.com`,
    passwordHash: 'hash',
    role: 'admin',
    isEmailVerified: true,
  });
  const client = await Client.create({ tenantId: tenant._id, name: 'Client', domain: 'client.test' });

  const ticket = await Ticket.create({
    tenantId: tenant._id,
    clientId: client._id,
    createdById: user._id,
    subject: 'Model Ticket',
    body: 'Body',
    customerEmail: 'cust@client.test',
    status: 'new',
    priority: 'medium',
    category: 'general',
    channel: 'email',
  });

  const reply = await TicketReply.create({
    tenantId: tenant._id,
    ticketId: ticket._id,
    authorType: 'human',
    authorId: user._id,
    body: 'Reply',
    deliveryStatus: 'queued',
    deliveryProvider: 'mock',
    providerMessageId: 'prov-123',
  });

  const foundTicket = await Ticket.findById(ticket._id).populate('clientId').exec();
  if (!foundTicket || String(foundTicket.clientId?._id) !== String(client._id))
    throw new Error('ticket client populate failed');

  const run = await WorkflowRun.create({
    tenantId: tenant._id,
    ticketId: ticket._id,
    startedByUserId: user._id,
    status: 'succeeded',
    startedAt: new Date(),
    endedAt: new Date(),
  });
  await WorkflowStep.create({
    tenantId: tenant._id,
    workflowRunId: run._id,
    name: 'triage',
    status: 'succeeded',
    durationMs: 10,
  });
  const steps = await WorkflowStep.find({ workflowRunId: run._id }).exec();
  if (steps.length !== 1) throw new Error('workflow step not saved');

  await mongoose.disconnect();
  console.log('Models OK');
}

module.exports = { run };
