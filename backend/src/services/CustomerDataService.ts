import Ticket from '../models/Ticket';
import { CustomerProfile } from '../shared/types/pipeline.types';
import { tenantScope } from '../shared/utils/tenantGuard';

export class CustomerDataService {
  async getProfile(tenantId: string, email: string): Promise<CustomerProfile> {
    if (!email) {
      return { totalTickets: 0 };
    }

    const tickets = await Ticket.find({ ...tenantScope(tenantId), customerEmail: email }).lean().exec();
    
    // basic metrics
    const totalTickets = tickets.length;
    let averageResolutionTimeHours: number | undefined;
    
    // calculate average resolution time
    const resolved = tickets.filter(t => (t.status === 'closed' || t.status === 'auto_resolved') && t.createdAt && t.updatedAt);
    if (resolved.length > 0) {
      const totalMs = resolved.reduce((acc: number, t) => {
        const start = t.createdAt ? new Date(t.createdAt as Date).getTime() : 0;
        const end = t.updatedAt ? new Date(t.updatedAt as Date).getTime() : Date.now();
        return acc + (end - start);
      }, 0);
      averageResolutionTimeHours = (totalMs / resolved.length) / (1000 * 60 * 60);
    }

    // calculate common category
    let commonCategory: string | undefined;
    if (tickets.length > 0) {
      const counts: Record<string, number> = {};
      tickets.forEach(t => {
        if (t.category) {
          counts[t.category] = (counts[t.category] || 0) + 1;
        }
      });
      const maxCat = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
      if (maxCat) commonCategory = maxCat;
    }

    // mock subscription based on domain
    let subscriptionTier = 'free';
    let lifetimeValue = 0;
    const domain = email.split('@')[1];
    
    if (domain) {
      if (['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain.toLowerCase())) {
        subscriptionTier = 'basic';
        lifetimeValue = 50;
      } else {
        subscriptionTier = 'enterprise';
        lifetimeValue = 5000;
      }
    }

    return {
      totalTickets,
      averageResolutionTimeHours,
      commonCategory,
      subscriptionTier,
      customerTier: subscriptionTier,
      lifetimeValue,
      churnRisk: totalTickets > 5 && (averageResolutionTimeHours ?? 0) > 48 ? 'high' : 'low',
      recentOrders: []
    };
  }
}
