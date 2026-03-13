'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  Zap,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Bot,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { fetchWithAccess } from '../../../lib/auth-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';

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
  ai: {
    triageRuns: number;
    suggestionsUsed: number;
    autoReplies: number;
  };
  hasIntegrations?: boolean;
  slaComplianceRate: number;
  avgCsat: number;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    handledCount: number;
    slaComplianceRate: number;
  }>;
}

interface MeResponse {
  user?: {
    email?: string;
    isEmailVerified?: boolean;
    name?: string;
  };
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageInner />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-96" />
        <Skeleton className="col-span-3 h-96" />
      </div>
    </div>
  );
}

function DashboardPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('welcome');
      const next = params.toString();
      const url = next ? `/dashboard?${next}` : '/dashboard';
      router.replace(url);
    }
  }, [router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const [statsRes, meRes] = await Promise.all([
          fetchWithAccess<DashboardStats>('/dashboard/stats'),
          fetchWithAccess<MeResponse>('/auth/me'),
        ]);
        if (cancelled) return;

        if (statsRes.status === 401) {
          router.push('/login');
          return;
        }

        if (!statsRes.ok) {
          setError('We could not load your dashboard right now.');
          return;
        }
        setStats(statsRes.data);
        if (meRes.ok) {
          setMe(meRes.data);
        }
      } catch {
        if (!cancelled) {
          setError('We could not load your dashboard right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleResendVerification = async () => {
    if (!me?.user?.email) return;
    setResendStatus('sending');
    try {
      const res = await fetchWithAccess<{ ok: boolean; error?: string }>(
        '/auth/resend-verification',
        {
          method: 'POST',
          body: JSON.stringify({ email: me.user.email }),
        },
      );
      if (!res.ok) {
        setResendStatus('error');
        return;
      }
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 5000);
    } catch {
      setResendStatus('error');
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-100 mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (!stats) return null;

  const openTickets =
    (stats.byStatus['new'] || 0) +
    (stats.byStatus['triaged'] || 0) +
    (stats.byStatus['awaiting_reply'] || 0);

  const urgentTickets = stats.byPriority['urgent'] || 0;

  const statusColors = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    triaged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    awaiting_reply: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="max-w-lg w-full border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to OpsFlow! 🚀</CardTitle>
              <CardDescription>
                Let&apos;s get your support desk connected. Connect your existing tools to
                supercharge your AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/settings/integrations">
                <div className="flex items-center justify-between p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        Connect Integrations
                      </div>
                      <div className="text-xs text-slate-400">Zendesk, Slack, Email, and more</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cyan-400" />
                </div>
              </Link>
              <Button variant="ghost" className="w-full" onClick={() => setShowWelcome(false)}>
                Skip for now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Dashboard</h1>
          <p className="text-slate-400">Overview of your support operations.</p>
        </div>
        <div className="flex items-center gap-2">
          {!stats.hasIntegrations && (
            <Link href="/settings/integrations">
              <Button variant="outline" size="sm" className="gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Connect Integrations
              </Button>
            </Link>
          )}
          <Link href="/tickets/new">
            <Button>
              <Ticket className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Verification Warning */}
      {me?.user?.email && me.user.isEmailVerified === false && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Please verify your email address ({me.user.email}).</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-200 hover:text-amber-100 hover:bg-amber-500/20"
            onClick={handleResendVerification}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
          >
            {resendStatus === 'sending'
              ? 'Sending...'
              : resendStatus === 'sent'
                ? 'Sent!'
                : 'Resend Email'}
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/tickets">
          <Card className="cursor-pointer transition-colors hover:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-slate-400">All time</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tickets">
          <Card className="cursor-pointer transition-colors hover:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTickets}</div>
              <p className="text-xs text-slate-400">
                {stats.byStatus['new'] || 0} new, {stats.byStatus['awaiting_reply'] || 0} awaiting
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tickets">
          <Card className="cursor-pointer transition-colors hover:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Attention</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{urgentTickets}</div>
              <p className="text-xs text-slate-400">High priority tickets</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="cursor-pointer transition-colors hover:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.slaComplianceRate > 0 ? `${stats.slaComplianceRate.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-slate-400">Tickets meeting SLA targets</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CSAT</CardTitle>
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgCsat > 0 ? stats.avgCsat.toFixed(1) : '—'} / 5.0
            </div>
            <p className="text-xs text-slate-400">Customer rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
        {/* Agent Performance */}
        <Card className="col-span-7 lg:col-span-3 border-slate-800 bg-slate-950/50">
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
            <CardDescription>SLA and resolution metrics per agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.agentPerformance && stats.agentPerformance.length > 0 ? (
                stats.agentPerformance.map((agent) => (
                  <div key={agent.agentId} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                        {agent.agentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 text-sm">{agent.agentName}</div>
                        <div className="text-xs text-slate-400">{agent.handledCount} tickets handled</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-200">
                        {agent.slaComplianceRate.toFixed(1)}% SLA
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No agent data this week.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance */}
      <h2 className="text-xl font-semibold text-slate-100 mt-8 mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-400" />
        AI Performance
      </h2>
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-purple-950/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">AI Triage Runs</CardTitle>
            <BrainCircuit className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">{stats.ai?.triageRuns || 0}</div>
            <p className="text-xs text-purple-400">Tickets analyzed automatically</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-950/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Suggestions Used</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">
              {stats.ai?.suggestionsUsed || 0}
            </div>
            <p className="text-xs text-purple-400">Drafts accepted by agents</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-950/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-200">Auto Replies</CardTitle>
            <Bot className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-100">{stats.ai?.autoReplies || 0}</div>
            <p className="text-xs text-purple-400">Fully automated resolutions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Tickets */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>
              You have {openTickets} open tickets requiring attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <Ticket className="h-8 w-8 mb-2 opacity-50" />
                  <p>No tickets found</p>
                </div>
              ) : (
                stats.recentTickets.map((ticket) => (
                  <Link
                    key={ticket._id}
                    href={`/tickets/${ticket._id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 p-4 transition-all hover:bg-slate-900 hover:border-slate-700 group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                          ticket.priority === 'urgent'
                            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                            : ticket.priority === 'high'
                              ? 'bg-orange-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                          {ticket.subject}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{ticket.customerName || 'Unknown Customer'}</span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${statusColors[ticket.status as keyof typeof statusColors] || statusColors.new}`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Integration Status */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Integrations and AI status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-200">System Operational</div>
                  <div className="text-xs text-slate-400">All systems go</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${stats.hasIntegrations ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-400'}`}
                >
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-200">Integrations</div>
                  <div className="text-xs text-slate-400">
                    {stats.hasIntegrations ? 'Connected' : 'No integrations connected'}
                  </div>
                </div>
              </div>
              {!stats.hasIntegrations && (
                <Link href="/settings/integrations">
                  <Button variant="ghost" size="sm" className="h-8">
                    Connect
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
