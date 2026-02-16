import { useEffect, useState } from 'react';
import { Activity, BarChart3, Clock, Smile } from 'lucide-react';
import api from '../lib/api';

interface MetricsSeriesPoint {
  date: string;
  count?: number;
  minutes?: number;
}

interface MetricsResponse {
  rangeDays: number;
  totalTickets: number;
  aiResolved: number;
  aiResolutionRate: number;
  avgResponseMinutes: number;
  customerSatisfaction: number | null;
  series: {
    volume: MetricsSeriesPoint[];
    aiVsHuman: {
      aiReplies: number;
      humanReplies: number;
    };
    responseTime: MetricsSeriesPoint[];
    sentiment: Record<string, number>;
    category: { category: string; count: number }[];
  };
}

type RangeKey = '7d' | '30d' | '90d';

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [range, setRange] = useState<RangeKey>('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = range === '7d' ? '' : `?range=${range}`;
        const res = await api.get(`/dashboard/metrics${query}`);
        setMetrics(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load metrics.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [range]);

  const aiResolutionPercent = metrics ? Math.round(metrics.aiResolutionRate * 100) : 0;
  const avgResponseMinutes = metrics ? Math.round(metrics.avgResponseMinutes) : 0;
  const satisfaction = metrics?.customerSatisfaction ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-primary">Metrics Dashboard</h2>
          <p className="text-sm text-text-muted">
            Ticket health, AI impact, and response speed for your workspace.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-1 py-1 shadow-sm border border-slate-200">
          <RangeButton label="Last 7 days" value="7d" current={range} onChange={setRange} />
          <RangeButton label="Last 30 days" value="30d" current={range} onChange={setRange} />
          <RangeButton label="Last 90 days" value="90d" current={range} onChange={setRange} />
        </div>
      </div>

      {isLoading && !metrics && (
        <div className="glass-panel rounded-2xl p-6 text-sm text-text-muted">
          <span className="sr-only">Loading metrics dashboard</span>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-40 bg-slate-100 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-20 rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="glass-panel rounded-2xl p-6 text-sm text-red-600">
          <div className="font-medium mb-1">Failed to load metrics.</div>
          <div className="text-xs text-text-muted mb-3">{error}</div>
          <button
            type="button"
            onClick={() => setRange((current) => current)}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-red-200 text-xs text-red-700 hover:bg-red-50 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total tickets"
              value={metrics.totalTickets}
              helper={`Last ${metrics.rangeDays} days`}
              icon={BarChart3}
              accent="bg-blue-500"
            />
            <MetricCard
              title="AI resolution rate"
              value={`${aiResolutionPercent}%`}
              helper={`${metrics.aiResolved} auto-resolved`}
              icon={Activity}
              accent="bg-emerald-500"
            />
            <MetricCard
              title="Average first response"
              value={`${avgResponseMinutes} min`}
              helper={`Across ${metrics.series.responseTime.length} days`}
              icon={Clock}
              accent="bg-violet-500"
            />
            <MetricCard
              title="Customer satisfaction"
              value={satisfaction != null ? `${satisfaction.toFixed(1)}/5` : 'Not tracked'}
              helper={satisfaction != null ? 'Based on recent feedback' : 'Hook up CSAT later'}
              icon={Smile}
              accent="bg-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Ticket volume over time" helper="Line shows tickets created per day">
              <LineChartSimple data={metrics.series.volume} valueKey="count" />
            </ChartCard>
            <ChartCard title="AI vs human replies" helper="How often AI sends the reply">
              <AiVsHumanChart
                ai={metrics.series.aiVsHuman.aiReplies}
                human={metrics.series.aiVsHuman.humanReplies}
              />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Response time trend" helper="Average first response in minutes">
              <LineChartSimple data={metrics.series.responseTime} valueKey="minutes" />
            </ChartCard>
            <ChartCard title="Sentiment distribution" helper="Based on AI analysis of tickets">
              <BarSeriesChart
                data={Object.entries(metrics.series.sentiment).map(([label, count]) => ({
                  label,
                  count,
                }))}
              />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top categories" helper="Most common ticket categories">
              <BarSeriesChart
                data={metrics.series.category.map((c) => ({
                  label: c.category || 'uncategorized',
                  count: c.count,
                }))}
              />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function RangeButton({
  label,
  value,
  current,
  onChange,
}: {
  label: string;
  value: RangeKey;
  current: RangeKey;
  onChange: (value: RangeKey) => void;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={
        isActive
          ? 'px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 text-white shadow-sm'
          : 'px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white'
      }
    >
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: any;
  accent: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${accent}`}>
        <Icon size={22} />
      </div>
      <div className="flex flex-col">
        <div className="text-xs uppercase tracking-wide text-text-muted">{title}</div>
        <div className="text-xl font-heading font-bold text-text-primary">{value}</div>
        <div className="text-xs text-text-muted mt-1">{helper}</div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  helper,
  children,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-text-primary">{title}</h3>
          {helper && <p className="text-xs text-text-muted mt-1">{helper}</p>}
        </div>
      </div>
      <div className="h-48 flex items-center justify-center">{children}</div>
    </div>
  );
}

function LineChartSimple({
  data,
  valueKey,
}: {
  data: MetricsSeriesPoint[];
  valueKey: 'count' | 'minutes';
}) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-text-muted">No data yet.</div>;
  }

  const values = data.map((d) => (d[valueKey] || 0) as number);
  const max = Math.max(...values);
  if (max <= 0) {
    return <div className="text-xs text-text-muted">No data yet.</div>;
  }

  const width = 260;
  const height = 120;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((d, index) => {
    const x = index * stepX;
    const v = (d[valueKey] || 0) as number;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  return (
    <svg width={width} height={height} className="text-accent-primary">
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path
        d={pathData}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, index) => {
        const x = index * stepX;
        const v = (d[valueKey] || 0) as number;
        const y = height - (v / max) * height;
        return <circle key={d.date + index} cx={x} cy={y} r={3} fill="#3b82f6" />;
      })}
    </svg>
  );
}

function AiVsHumanChart({ ai, human }: { ai: number; human: number }) {
  const total = ai + human;
  if (total === 0) {
    return <div className="text-xs text-text-muted">No replies yet.</div>;
  }
  const aiPercent = Math.round((ai / total) * 100);
  const humanPercent = 100 - aiPercent;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-text-muted mb-2">
        <span>AI {aiPercent}%</span>
        <span>Human {humanPercent}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden flex">
        <div className="h-full bg-emerald-500" style={{ width: `${aiPercent}%` }} />
        <div className="h-full bg-slate-500" style={{ width: `${humanPercent}%` }} />
      </div>
    </div>
  );
}

function BarSeriesChart({ data }: { data: { label: string; count: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="text-xs text-text-muted">No data yet.</div>;
  }
  const max = Math.max(...data.map((d) => d.count));
  if (max <= 0) {
    return <div className="text-xs text-text-muted">No data yet.</div>;
  }

  return (
    <div className="w-full space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="w-20 text-[11px] text-text-muted truncate capitalize">
            {item.label.replace('_', ' ')}
          </div>
          <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <div className="w-8 text-right text-xs text-text-muted">{item.count}</div>
        </div>
      ))}
    </div>
  );
}
