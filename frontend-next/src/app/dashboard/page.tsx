'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAccess } from '../../lib/auth-client';

interface DashboardStats {
  totalTickets: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  recentTickets: Array<{
    _id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    customerName?: string;
  }>;
  totalUsers: number;
  ai?: {
    triageRuns: number;
    suggestionsUsed: number;
    autoReplies: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      const res = await fetchWithAccess<DashboardStats>('/dashboard/stats');
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('We could not load your dashboard right now.');
        }
        setIsLoading(false);
        return;
      }
      setStats(res.data);
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const openTickets =
    (stats?.byStatus['new'] || 0) +
    (stats?.byStatus['triaged'] || 0) +
    (stats?.byStatus['awaiting_reply'] || 0);
  const urgentTickets = stats?.byPriority['urgent'] || 0;
  const recentTickets = stats?.recentTickets || [];
  const statusEntries = Object.entries(stats?.byStatus || {});
  const aiStats = stats?.ai || { triageRuns: 0, suggestionsUsed: 0, autoReplies: 0 };

  if (error && !isLoading && !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-slate-950/80 p-6 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">
            We could not load your dashboard
          </h2>
          <p className="text-sm text-white/60 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-cyan-500 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!stats && isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-6 w-40 bg-white/10 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-7 w-16 bg-white/15 rounded" />
              <div className="h-3 w-20 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-sm text-white/70">
        No dashboard data available yet. Create your first ticket to see insights here.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10 space-y-8 text-white">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-white/70">
          Overview of your support desk across tickets, workload, and team.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Tickets" value={stats.totalTickets} href="/tickets" />
        <StatCard title="Open Issues" value={openTickets} href="/tickets?status=new" />
        <StatCard title="Urgent" value={urgentTickets} href="/tickets?priority=urgent" />
        <StatCard title="Team Members" value={stats.totalUsers} href="/team" />
        <StatCard title="AI Triage Runs" value={aiStats.triageRuns} href="/tickets" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Tickets</h2>
          <div className="space-y-4">
            {recentTickets.length === 0 ? (
              <p className="text-sm text-white/60">No recent tickets found.</p>
            ) : (
              recentTickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  href={`/tickets/${ticket._id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 hover:border-cyan-400/60 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{ticket.subject}</p>
                      {ticket.customerName && (
                        <span className="text-xs text-white/60 truncate">
                          • {ticket.customerName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-white/10 border border-white/20">
                      {ticket.status}
                    </span>
                    <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/15">
                      {ticket.priority}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link href="/tickets" className="text-sm text-cyan-300 hover:text-cyan-200 font-medium">
              View all tickets →
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold mb-4">Status Breakdown</h2>
            <div className="space-y-3">
              {statusEntries.map(([status, count]) => (
                <Link
                  key={status}
                  href={`/tickets?status=${encodeURIComponent(status)}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-900/60 transition-colors"
                >
                  <span className="text-sm text-white/70">{status.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-white">{count}</span>
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-white/10">
              <Link
                href="/tickets?mine=true"
                className="text-xs text-cyan-300 hover:text-cyan-200 font-medium"
              >
                View tickets assigned to me
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-6">
            <h2 className="text-lg font-semibold mb-4">AI Usage</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-white/70">Triage runs</dt>
                <dd className="font-semibold text-white">{aiStats.triageRuns}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-white/70">Suggestions used</dt>
                <dd className="font-semibold text-white">{aiStats.suggestionsUsed}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-white/70">Auto replies sent</dt>
                <dd className="font-semibold text-white">{aiStats.autoReplies}</dd>
              </div>
            </dl>
            <div className="mt-4 text-[11px] text-white/60">
              Based on recorded user actions. Use this to see how much your team leans on AI.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  href: string;
}

function StatCard({ title, value, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 flex flex-col gap-2 hover:border-cyan-400/60 transition-colors"
    >
      <span className="text-xs text-white/60">{title}</span>
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-[11px] text-white/50">View details</span>
    </Link>
  );
}
