import mongoose from 'mongoose';
import SLAPolicy from '../models/SLAPolicy';
import Tenant from '../models/Tenant';
import { connectDB } from '../db';

async function seedSLAPolicies() {
  await connectDB();
  const tenants = await Tenant.find();

  for (const tenant of tenants) {
    const policies = [
      {
        tenantId: tenant._id,
        name: 'Starter',
        tier: 'starter',
        firstResponseTarget: 480, // 8 hours
        resolutionTarget: 1440,   // 24 hours
        businessHoursOnly: true,
      },
      {
        tenantId: tenant._id,
        name: 'Growth',
        tier: 'growth',
        firstResponseTarget: 240, // 4 hours
        resolutionTarget: 480,    // 8 hours
        businessHoursOnly: true,
      },
      {
        tenantId: tenant._id,
        name: 'Enterprise',
        tier: 'enterprise',
        firstResponseTarget: 60,  // 1 hour
        resolutionTarget: 240,    // 4 hours
        businessHoursOnly: true,
      },
    ];

    for (const policy of policies) {
      await SLAPolicy.findOneAndUpdate(
        { tenantId: tenant._id, tier: policy.tier },
        policy,
        { upsert: true }
      );
    }
  }

  console.log('SLA Policies seeded.');
  process.exit(0);
}

if (require.main === module) {
  seedSLAPolicies();
}
