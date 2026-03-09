'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchWithAccess } from '../../../../lib/auth-client';

type RangeKey = '7d' | '30d' | '90d';

interface MetricsResponse {
  ticketVolume: {
    total: number;
    byDay: { date: string; count: number }[];
  };
  aiResolutionRate: {
    total: number;
    autoResolved: number;
  };
  responseTime: {
    p50: number;
    p90: number;
  };
}

interface AiMetricsEntry {
  _id: 'classification' | 'answer_generation' | 'self_eval';
  totalCalls: number;
  successes: number;
  failures: number;
  avgLatencyMs: number;
}

interface AiReviewTicket {
  _id: string;
  subject: string;
  aiAnalysis?: {
    createdAt?: string;
    risk?: string;
    faithfulness?: string;
    completeness?: string;
  };
}

export default function MetricsDashboardPage() {
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>('7d');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiMetrics, setAiMetrics] = useState<AiMetricsEntry[] | null>(null);
  const [aiReview, setAiReview] = useState<AiReviewTicket[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const q = range === '7d' ? '' : `?range=${range}`;
      const res = await fetchWithAccess<MetricsResponse>(`/dashboard/metrics${q}`);
      if (cancelled) return;
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load metrics.');
        }
        setLoading(false);
        return;
      }
      setMetrics(res.data);

      const aiMetricsRes = await fetchWithAccess<AiMetricsEntry[]>(`/tickets/ai/metrics`);
      if (!aiMetricsRes.ok) {
        if (aiMetricsRes.status === 401) {
          router.push('/login');
          return;
        }
      } else {
        setAiMetrics(aiMetricsRes.data || null);
      }

      const aiReviewRes = await fetchWithAccess<AiReviewTicket[]>(`/tickets/ai/review?limit=20`);
      if (!aiReviewRes.ok) {
        if (aiReviewRes.status === 401) {
          router.push('/login');
          return;
        }
      } else {
        setAiReview(aiReviewRes.data || null);
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [range, router]);

  const autoTotal = metrics?.aiResolutionRate?.total ?? 0;
  const autoResolved = metrics?.aiResolutionRate?.autoResolved ?? 0;
  const autoRate = autoTotal > 0 ? Math.round((autoResolved / autoTotal) * 100) : 0;

  return (
    <div className="container mx-auto px-6 py-10 text-white space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Metrics</h1>
          <p className="text-sm text-white/70">
            Track ticket volume, AI resolution, and response times.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 text-[11px] text-white/60">
            <Link
              href="/dashboard"
              className="px-2 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
            >
              ← Back to dashboard
            </Link>
            <Link
              href="/tickets"
              className="px-2 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
            >
              Tickets
            </Link>
            <Link
              href="/settings"
              className="px-2 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
            >
              Settings
            </Link>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 p-1 text-xs">
          {(['7d', '30d', '90d'] as RangeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`px-3 py-1 rounded-full font-medium ${
                range === key ? 'bg-white text-slate-950' : 'text-white/70 hover:bg-white/10'
              }`}
            >
              {key === '7d' ? 'Last 7 days' : key === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/60 mb-1">Total tickets</p>
          <p className="text-2xl font-semibold">
            {metrics?.ticketVolume?.total ?? (loading ? '…' : 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/60 mb-1">AI auto-resolve rate</p>
          <p className="text-2xl font-semibold">{loading ? '…' : `${autoRate}%`}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/60 mb-1">Response time (p50)</p>
          <p className="text-2xl font-semibold">
            {metrics?.responseTime?.p50
              ? `${Math.round(metrics.responseTime.p50)} min`
              : loading
                ? '…'
                : '—'}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-sm font-semibold mb-4">Ticket volume over time</h2>
          {loading && !metrics ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-6 rounded-lg bg-white/10 animate-pulse" />
              ))}
            </div>
          ) : !metrics || !metrics.ticketVolume || metrics.ticketVolume.byDay.length === 0 ? (
            <p className="text-xs text-white/60">No ticket data available for this range yet.</p>
          ) : (
            <div className="space-y-2">
              {metrics.ticketVolume.byDay.map((d) => (
                <div key={d.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{new Date(d.date).toLocaleDateString()}</span>
                    <span>{d.count} tickets</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${Math.min(d.count * 8, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4">
          <h2 className="text-sm font-semibold">Response time distribution</h2>
          {loading && !metrics ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-6 rounded-lg bg-white/10 animate-pulse" />
              ))}
            </div>
          ) : !metrics || !metrics.responseTime ? (
            <p className="text-xs text-white/60">No response time data for this range.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>p50</span>
                  <span>{Math.round(metrics.responseTime.p50)} min</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{
                      width: `${Math.min(metrics.responseTime.p50 * 3, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>p90</span>
                  <span>{Math.round(metrics.responseTime.p90)} min</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400"
                    style={{
                      width: `${Math.min(metrics.responseTime.p90 * 2, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-4">
          <h2 className="text-sm font-semibold">AI usage</h2>
          {!aiMetrics || aiMetrics.length === 0 ? (
            <p className="text-xs text-white/60">
              No AI usage data yet. Run triage on a few tickets to see metrics.
            </p>
          ) : (
            <div className="space-y-2">
              {aiMetrics.map((m) => {
                const successRate =
                  m.totalCalls > 0 ? Math.round((m.successes / m.totalCalls) * 100) : 0;
                const label =
                  m._id === 'classification'
                    ? 'Classification calls'
                    : m._id === 'answer_generation'
                      ? 'Draft replies'
                      : 'Self-evaluations';
                return (
                  <div
                    key={m._id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{label}</div>
                      <div className="text-[11px] text-white/60">
                        {m.totalCalls} calls • {successRate}% success • avg{' '}
                        {Math.round(m.avgLatencyMs)} ms
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-white/60">
                      <div>OK: {m.successes}</div>
                      <div>Errors: {m.failures}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 space-y-3">
          <h2 className="text-sm font-semibold">Tickets needing AI review</h2>
          {!aiReview || aiReview.length === 0 ? (
            <p className="text-xs text-white/60">
              No high-risk or heavily edited AI replies detected yet.
            </p>
          ) : (
            <div className="space-y-2">
              {aiReview.map((t) => (
                <Link
                  key={t._id}
                  href={`/tickets/${t._id}`}
                  className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-medium text-white truncate">{t.subject}</div>
                    <div className="text-[10px] text-white/60">
                      {t.aiAnalysis?.risk ? `Risk: ${t.aiAnalysis.risk}` : 'Risk: unknown'}
                    </div>
                  </div>
                  <div className="text-[10px] text-white/60">
                    {t.aiAnalysis?.faithfulness && (
                      <span>Faithfulness: {t.aiAnalysis.faithfulness}. </span>
                    )}
                    {t.aiAnalysis?.completeness && (
                      <span>Completeness: {t.aiAnalysis.completeness}. </span>
                    )}
                    {t.aiAnalysis?.createdAt && (
                      <span>
                        Last AI run:{' '}
                        {new Date(t.aiAnalysis.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
