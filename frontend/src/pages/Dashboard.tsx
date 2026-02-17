import { useState, useEffect } from 'react';
import { Ticket, Users, Clock, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { Link, useSearchParams } from 'react-router-dom';

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
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    if (searchParams.get('welcome') === 'true') {
      setShowWelcome(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('welcome');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, userRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/auth/me'),
        ]);
        setStats(statsRes.data);
        setUser(userRes.data.user);
        setError(null);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Session expired. Redirecting to login...');
          return;
        }
        console.error('Failed to fetch dashboard data', err);
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendStatus('sending');
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setResendStatus('error');
    }
  };

  const showSkeleton = isLoading && !stats && !error;

  if (error && !isLoading && !stats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass-panel rounded-2xl p-6 text-center">
          <h2 className="text-lg font-heading font-bold text-text-primary mb-2">
            We couldn't load your dashboard
          </h2>
          <p className="text-sm text-text-muted mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-grad-main text-white text-sm font-medium shadow hover:shadow-md transition-shadow"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!stats && !isLoading) {
    return (
      <div className="p-8 text-sm text-text-muted">
        No dashboard data available yet. Create your first ticket to see insights here.
      </div>
    );
  }

  const openTickets =
    (stats?.byStatus['new'] || 0) +
    (stats?.byStatus['triaged'] || 0) +
    (stats?.byStatus['awaiting_reply'] || 0);
  const urgentTickets = stats?.byPriority['urgent'] || 0;
  const recentTickets = stats?.recentTickets || [];
  const statusEntries = Object.entries(stats?.byStatus || {});

  return (
    <div className="space-y-6">
      {showWelcome && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
          Welcome to OpsFlow! Explore your dashboard below.
        </div>
      )}
      {user && !user.isEmailVerified && (
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 flex items-center justify-between">
          <span>Please verify your email to unlock all features.</span>
          <button
            onClick={handleResendVerification}
            className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            {resendStatus === 'sending'
              ? 'Sending...'
              : resendStatus === 'sent'
                ? 'Sent'
                : resendStatus === 'error'
                  ? 'Error'
                  : 'Resend'}
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-text-primary">Dashboard</h2>
        <div className="text-sm text-text-muted">Overview of your support desk</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {showSkeleton ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl p-5 animate-pulse bg-white/60 border border-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                  <div className="h-5 w-16 bg-slate-100 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total Tickets"
              value={stats?.totalTickets || 0}
              icon={Ticket}
              color="bg-blue-500"
              href="/tickets"
            />
            <StatCard
              title="Open Issues"
              value={openTickets}
              icon={Clock}
              color="bg-yellow-500"
              href="/tickets?status=new"
            />
            <StatCard
              title="Urgent"
              value={urgentTickets}
              icon={AlertTriangle}
              color="bg-red-500"
              href="/tickets?priority=urgent"
            />
            <StatCard
              title="Team Members"
              value={stats?.totalUsers || 0}
              icon={Users}
              color="bg-purple-500"
              href="/team"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Recent Tickets</h3>
          <div className="space-y-4">
            {recentTickets.length === 0 ? (
              <p className="text-text-muted text-sm">No recent tickets found.</p>
            ) : (
              recentTickets.map((ticket) => (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="font-medium text-text-primary mb-1">{ticket.subject}</div>
                    <div className="text-xs text-text-muted">
                      {ticket.customerName || 'Unknown Customer'} •{' '}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : ticket.priority === 'high'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-text-muted`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link to="/tickets" className="text-sm text-accent-primary hover:underline font-medium">
              View all tickets &rarr;
            </Link>
          </div>
        </div>

        {/* Quick Status */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-heading font-bold text-lg mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {statusEntries.map(([status, count]) => (
              <Link
                key={status}
                to={`/tickets?status=${status}`}
                className="flex items-center justify-between hover:bg-white rounded-xl px-3 -mx-3 py-2 transition-colors"
              >
                <span className="text-sm capitalize text-text-muted">
                  {status.replace('_', ' ')}
                </span>
                <span className="font-medium text-text-primary">{count}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/tickets?mine=true"
              className="text-xs text-accent-primary hover:underline font-medium"
            >
              View tickets assigned to me
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  href?: string;
}) {
  const CardInner = (
    <div className="glass-panel rounded-2xl p-6 flex items-center gap-4 hover:bg-white transition-colors">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color} shadow-lg shadow-${color.replace('bg-', '')}/20`}
      >
        <Icon size={24} />
      </div>
      <div>
        <div className="text-sm text-text-muted font-medium">{title}</div>
        <div className="text-2xl font-heading font-bold text-text-primary">{value}</div>
      </div>
    </div>
  );
  return href ? <Link to={href}>{CardInner}</Link> : CardInner;
}
