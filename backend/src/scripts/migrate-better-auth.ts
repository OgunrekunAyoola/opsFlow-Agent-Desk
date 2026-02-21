import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Tenant from '../models/Tenant';
import { auth } from '../auth';

dotenv.config();

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/opsflow';
  await mongoose.connect(mongoUri);

  const tenants = await Tenant.find().exec();

  for (const tenant of tenants) {
    const tenantId = tenant._id.toString();
    const orgName = tenant.name || 'Tenant';

    const org = await (auth as any).api.createOrganization({
      name: orgName,
      metadata: { tenantId },
    });

    const users = await User.find({ tenantId: tenant._id }).exec();

    for (const user of users) {
      const email = user.email.toLowerCase();
      const createdUser = await (auth as any).api.createUser({
        email,
        name: user.name || email,
        emailVerified: user.isEmailVerified ? new Date() : null,
      });
      await (auth as any).api.addMemberToOrganization({
        organizationId: org.organization.id,
        userId: createdUser.user.id,
        role: user.role === 'admin' ? 'admin' : 'member',
      });
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
