import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';
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

router.get('/metrics', requireAuth, async (req, res) => {
  const { tenantId } = (req as any).currentUser;
  const { range } = (req.query as any) || {};

  try {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const now = new Date();
    let days = 7;
    if (range === '30d') days = 30;
    if (range === '90d') days = 90;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const matchBase = { tenantId: tenantObjectId, createdAt: { $gte: from, $lte: now } } as any;

    const totalTicketsAgg = await Ticket.aggregate([{ $match: matchBase }, { $count: 'count' }]);
    const totalTickets = totalTicketsAgg[0]?.count || 0;

    const aiResolvedAgg = await Ticket.aggregate([
      { $match: { ...matchBase, status: 'auto_resolved' } },
      { $count: 'count' },
    ]);
    const aiResolved = aiResolvedAgg[0]?.count || 0;

    const aiResolutionRate = totalTickets > 0 ? aiResolved / totalTickets : 0;

    const firstReplyAgg = await TicketReply.aggregate([
      { $match: { tenantId: tenantObjectId } },
      { $sort: { ticketId: 1, createdAt: 1 } },
      {
        $group: {
          _id: '$ticketId',
          firstReplyAt: { $first: '$createdAt' },
        },
      },
    ]);

    const firstReplyMap = new Map<string, Date>();
    firstReplyAgg.forEach((r: any) => {
      if (r._id && r.firstReplyAt) {
        firstReplyMap.set(String(r._id), r.firstReplyAt);
      }
    });

    const ticketsForResponse = await Ticket.find({
      tenantId,
      createdAt: { $gte: from, $lte: now },
    })
      .select('_id createdAt')
      .lean()
      .exec();

    let totalResponseMs = 0;
    let responseCount = 0;
    const responseTimeBuckets: Record<string, { totalMs: number; count: number }> = {};

    ticketsForResponse.forEach((t) => {
      const first = firstReplyMap.get(String(t._id));
      if (!first) return;
      const ms = first.getTime() - (t.createdAt as any as Date).getTime();
      if (ms < 0) return;
      totalResponseMs += ms;
      responseCount += 1;
      const key = new Date(t.createdAt as any as Date).toISOString().slice(0, 10);
      if (!responseTimeBuckets[key]) {
        responseTimeBuckets[key] = { totalMs: 0, count: 0 };
      }
      responseTimeBuckets[key].totalMs += ms;
      responseTimeBuckets[key].count += 1;
    });

    const avgResponseMinutes = responseCount > 0 ? totalResponseMs / responseCount / 1000 / 60 : 0;

    const volumeAgg = await Ticket.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const volumeSeries = volumeAgg.map((v: any) => ({
      date: v._id,
      count: v.count,
    }));

    const replyAgg = await TicketReply.aggregate([
      { $match: { tenantId: tenantObjectId } },
      {
        $group: {
          _id: '$authorType',
          count: { $sum: 1 },
        },
      },
    ]);

    const aiReplies = replyAgg.find((r: any) => r._id === 'ai')?.count || 0;
    const humanReplies = replyAgg.find((r: any) => r._id === 'human')?.count || 0;

    const sentimentAgg = await Ticket.aggregate([
      {
        $match: {
          ...matchBase,
          'aiAnalysis.sentiment': { $in: ['positive', 'neutral', 'negative'] },
        },
      },
      {
        $group: {
          _id: '$aiAnalysis.sentiment',
          count: { $sum: 1 },
        },
      },
    ]);

    const sentimentByLabel: Record<string, number> = {};
    sentimentAgg.forEach((s: any) => {
      sentimentByLabel[s._id] = s.count;
    });

    const categoryAgg = await Ticket.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const categoryBreakdown = categoryAgg.map((c: any) => ({
      category: c._id,
      count: c.count,
    }));

    const responseTimeSeries = Object.entries(responseTimeBuckets)
      .map(([date, bucket]) => ({
        date,
        minutes: bucket.totalMs / bucket.count / 1000 / 60,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    res.json({
      rangeDays: days,
      totalTickets,
      aiResolved,
      aiResolutionRate,
      avgResponseMinutes,
      customerSatisfaction: null,
      series: {
        volume: volumeSeries,
        aiVsHuman: {
          aiReplies,
          humanReplies,
        },
        responseTime: responseTimeSeries,
        sentiment: sentimentByLabel,
        category: categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

export default router;
