import bcrypt from 'bcryptjs';
import User from '../models/User';
import Notification from '../models/Notification';
import { tenantScope } from '../shared/utils/tenantGuard';

export class UserService {
  async listUsers(tenantId: string) {
    const users = await User.find({ ...tenantScope(tenantId) })
      .select('name email role createdAt updatedAt')
      .exec();
    return users;
  }

  async createUser(tenantId: string, data: any) {
    const { name, email, password, role } = data;
    if (!name || !email || !password) throw new Error('invalid');
    
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      tenantId,
      name,
      email,
      passwordHash: hash,
      role: role === 'admin' ? 'admin' : 'member',
    });

    try {
      const admins = await User.find({
        ...tenantScope(tenantId),
        role: 'admin',
        _id: { $ne: user._id },
      })
        .select('_id')
        .exec();
      if (admins.length > 0) {
        const message = `${user.name || user.email} joined the team`;
        await Notification.insertMany(
          admins.map((admin) => ({
            tenantId,
            userId: admin._id,
            type: 'team_member_joined',
            message,
            url: '/team',
          })),
        );
      }
    } catch {}

    return { id: user._id, name: user.name, email: user.email, role: user.role };
  }
}
