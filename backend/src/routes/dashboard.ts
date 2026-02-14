import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';
import Ticket from '../models/Ticket';
import User from '../models/User';

const router = Router();

router.get('/stats', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;

  try {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    // 1. Ticket Counts by Status
    const statusCounts = await Ticket.aggregate([
      { $match: { tenantId: tenantObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 2. Ticket Counts by Priority
    const priorityCounts = await Ticket.aggregate([
      { $match: { tenantId: tenantObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // 3. Recent Tickets
    const recentTickets = await Ticket.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject status priority createdAt customerName')
      .exec();

    // 4. Total Users (for team stats)
    const totalUsers = await User.countDocuments({ tenantId });

    // Format stats for frontend
    const stats = {
      totalTickets: statusCounts.reduce((acc, curr) => acc + curr.count, 0),
      byStatus: statusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      byPriority: priorityCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      recentTickets,
      totalUsers,
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
