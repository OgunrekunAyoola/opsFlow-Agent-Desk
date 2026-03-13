import 'dotenv/config';
import { connectDB } from '../db';
import SLAPolicy from '../models/SLAPolicy';
import Tenant from '../models/Tenant';
import mongoose from 'mongoose';

async function seedSLAPolicies() {
  await connectDB();
  console.log('Connected to DB for seeding SLAs...');

  const tenants = await Tenant.find({});
  if (tenants.length === 0) {
    console.log('No tenants found. Please create a tenant first.');
    process.exit(0);
  }

  const defaultPolicies = [
    {
      name: 'Starter',
      tier: 'starter',
      firstResponseTarget: 8 * 60, // 8 hours
      resolutionTarget: 24 * 60,   // 24 hours
      businessHoursOnly: true,
    },
    {
      name: 'Growth',
      tier: 'growth',
      firstResponseTarget: 4 * 60, // 4 hours
      resolutionTarget: 8 * 60,    // 8 hours
      businessHoursOnly: true,
    },
    {
      name: 'Enterprise',
      tier: 'enterprise',
      firstResponseTarget: 60,     // 1 hour
      resolutionTarget: 4 * 60,    // 4 hours
      businessHoursOnly: true,
    },
  ];

  for (const tenant of tenants) {
    for (const policyData of defaultPolicies) {
      const exists = await SLAPolicy.findOne({ tenantId: tenant._id, tier: policyData.tier });
      if (!exists) {
        await SLAPolicy.create({
          ...policyData,
          tenantId: tenant._id,
        });
        console.log(`Created ${policyData.name} policy for tenant ${tenant.name}`);
      } else {
        console.log(`${policyData.name} policy already exists for tenant ${tenant.name}`);
      }
    }
  }

  console.log('SLA Seeding completed.');
  process.exit(0);
}

seedSLAPolicies().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
