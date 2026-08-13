'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  Layers3,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMetrics } from '@/lib/hooks/useMetrics';
import type { RecentRequest, UsageSummary } from '@/lib/types/proxy';

const numberFormatter = new Intl.NumberFormat('en-US');

function rate(ok: number, total: number): string {
  return total === 0 ? '—' : `${Math.round((ok / total) * 100)}%`;
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  tone: 'accent' | 'success' | 'warning' | 'error';
}) {
  const toneClasses = {
    accent: 'bg-accent/15 text-accent',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    error: 'bg-error/15 text-error',
  };

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-text-muted">{detail}</p>
        </div>
        <span className={`rounded-md p-2.5 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-72 flex-col items-center justify-center text-center">
      <Activity className="h-8 w-8 text-text-muted" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium">No requests in this window</p>
      <p className="mt-1 max-w-xs text-xs text-text-muted">
        Send a request through proxyrs and this chart will update automatically.
      </p>
    </div>
  );
}

function RecentRequests({ requests }: { requests: RecentRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-text-muted">
        No request history is available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
          <tr>
            <th className="px-1 py-3 font-medium">Model</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Latency</th>
            <th className="px-3 py-3 text-right font-medium">Tokens</th>
          </tr>
        </thead>
        <tbody>
          {requests.slice(0, 20).map((request, index) => {
            const successful = request.status !== undefined && request.status < 400;
            return (
              <tr key={`${request.timestamp ?? 'request'}-${index}`} className="border-b border-border/60">
                <td className="px-1 py-3 font-mono text-xs">{request.model ?? 'Unknown model'}</td>
                <td className="px-3 py-3">
                  <span className={`badge ${successful ? 'badge-success' : 'badge-error'}`}>
                    {request.status ?? '—'}
                  </span>
                </td>
                <td className="px-3 py-3 text-text-muted">{request.latency_ms ?? 0} ms</td>
                <td className="px-3 py-3 text-right text-text-muted">
                  {numberFormatter.format(request.total_tokens ?? 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const { data, error, isLoading, mutate } = useMetrics();
  const summary: UsageSummary | undefined = data?.summary.window;
  const requests = summary?.requests ?? 0;
  const pieData = [
    { name: 'Success', value: summary?.ok ?? 0, color: '#6EE7B7' },
    { name: 'Rate limited', value: summary?.rate_limited ?? 0, color: '#F59E0B' },
    { name: 'Failed', value: Math.max(0, (summary?.fail ?? 0) - (summary?.rate_limited ?? 0)), color: '#F43F5E' },
  ].filter((entry) => entry.value > 0);

  if (error) {
    return (
      <section className="card border-error/40">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">Unable to reach proxyrs</h2>
            <p className="mt-1 text-sm text-text-muted">
              Check that the proxy is running at {process.env.NEXT_PUBLIC_PROXY_URL ?? 'http://127.0.0.1:3001'}.
            </p>
            <button type="button" className="btn btn-secondary mt-4 px-4 py-2 text-sm" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-text-muted">Live overview, refreshes every 10 seconds</p>
          <h2 className="mt-1 text-2xl font-semibold">Proxy activity</h2>
        </div>
        <button
          type="button"
          className="btn btn-secondary px-4 py-2 text-sm"
          disabled={isLoading}
          onClick={() => mutate()}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Requests" value={numberFormatter.format(requests)} detail="Last five minutes" icon={Activity} tone="accent" />
        <StatCard title="Success rate" value={rate(summary?.ok ?? 0, requests)} detail={`${numberFormatter.format(summary?.ok ?? 0)} successful`} icon={CheckCircle2} tone="success" />
        <StatCard title="Average latency" value={summary ? `${summary.latency_ms_avg} ms` : '—'} detail="Successful and failed requests" icon={Clock3} tone="warning" />
        <StatCard title="Tokens" value={numberFormatter.format(summary?.total_tokens ?? 0)} detail={`${data?.model_status.all.length ?? 0} configured models`} icon={Zap} tone="accent" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <article className="card">
          <div className="mb-5">
            <h3 className="font-semibold">Request activity</h3>
            <p className="mt-1 text-sm text-text-muted">Requests and failures over the selected five-minute window</p>
          </div>
          {data?.timeseries.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeseries}>
                  <defs>
                    <linearGradient id="requestsGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2A3444" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fill: '#92929E', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#92929E', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={{ background: '#161D2B', border: '1px solid #2A3444', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="requests" stroke="#38BDF8" fill="url(#requestsGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="fail" stroke="#F43F5E" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </article>

        <article className="card">
          <div className="mb-5">
            <h3 className="font-semibold">Response health</h3>
            <p className="mt-1 text-sm text-text-muted">Current request outcomes</p>
          </div>
          {pieData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={94} paddingAngle={3}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#161D2B', border: '1px solid #2A3444', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </article>
      </div>

      <article className="card">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Recent requests</h3>
            <p className="mt-1 text-sm text-text-muted">The latest proxyrs activity, with no prompts or responses stored.</p>
          </div>
          <Layers3 className="h-5 w-5 text-text-muted" aria-hidden="true" />
        </div>
        <RecentRequests requests={data?.recent ?? []} />
      </article>

      <p className="flex items-center gap-2 text-xs text-text-muted">
        <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
        {data ? `Updated ${new Date(data.generated_at).toLocaleTimeString()}` : 'Loading metrics…'}
      </p>
    </section>
  );
}
