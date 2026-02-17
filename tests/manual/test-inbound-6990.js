const path = require('path');
const axios = require('axios');
const mongoose = require('../../backend/node_modules/mongoose');
const dotenv = require('../../backend/node_modules/dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });

const API_URL = process.env.API_URL || 'http://127.0.0.1:3000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opsflow';

const inboundAddress = 'support+6990a8918a78966f7bd91f2a@opsflow.test';

async function main() {
  console.log('Using API_URL:', API_URL);
  console.log('Using MONGO_URI:', MONGO_URI);
  console.log('Inbound address:', inboundAddress);

  const TicketModule = require('../../backend/dist/models/Ticket');
  const Ticket = TicketModule.default || TicketModule;

  await mongoose.connect(MONGO_URI);

  const tenantId = new mongoose.Types.ObjectId('6990a8918a78966f7bd91f2a');

  const beforeCount = await Ticket.countDocuments({ tenantId }).exec();
  console.log('Initial ticket count for tenant:', beforeCount);

  const messageId = 'manual-test-6990-' + Date.now();
  const payload = {
    to: inboundAddress,
    from: 'customer@example.com',
    subject: 'Manual test inbound 6990',
    text: 'This is a test inbound email for tenant 6990.',
    messageId,
  };

  console.log('\n1) Sending inbound email via /email/inbound...');
  const resp = await axios.post(`${API_URL}/email/inbound`, payload);
  console.log('Inbound HTTP status:', resp.status);
  console.log('Inbound response ticket id:', resp.data.ticket && resp.data.ticket._id);

  console.log('\n2) Checking database for created ticket...');
  const ticket = await Ticket.findOne({ tenantId, messageId }).exec();
  if (!ticket) {
    console.log('Ticket not found in DB for messageId', messageId);
  } else {
    console.log('Ticket found in DB:', {
      id: ticket._id.toString(),
      subject: ticket.subject,
      createdAt: ticket.createdAt,
      tenantId: ticket.tenantId.toString(),
    });
  }

  const afterCount = await Ticket.countDocuments({ tenantId }).exec();
  console.log('Ticket count for tenant after inbound:', afterCount);

  await mongoose.disconnect();

  console.log(
    '\n3) Dashboard implication: totalTickets for this tenant increased by',
    afterCount - beforeCount,
  );
}

main().catch((err) => {
  console.error('Error in manual inbound test:', err);
  process.exit(1);
});
