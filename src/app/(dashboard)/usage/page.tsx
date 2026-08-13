'use client';

import { BarChart3, Download, FileJson, FileSpreadsheet, RefreshCw } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState } from 'react';
import { useUsage } from '@/lib/hooks/useUsage';
import { useSettingsStore } from '@/lib/stores/settings';
import { estimateCost, formatCost } from '@/lib/utils/cost';

const ranges = [
  { label: 'Today', days: 1 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
];

const formatter = new Intl.NumberFormat('en-US');

export default function UsagePage() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading, mutate } = useUsage(days);
  const costRates = useSettingsStore((state) => state.costPerThousandTokens);
  const modelUsage = data?.by_model_today ?? [];
  const estimatedCost = modelUsage.reduce<number | null>((total, entry) => {
    const cost = estimateCost(entry.total_tokens, costRates[entry.model]);
    return cost === null ? total : (total ?? 0) + cost;
  }, null);
  const modelsWithRates = modelUsage.filter((entry) => estimateCost(entry.total_tokens, costRates[entry.model]) !== null).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">Privacy-safe aggregates from proxyrs</p>
          <h2 className="mt-1 text-2xl font-semibold">Usage analytics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <button
              key={range.days}
              type="button"
              className={`rounded-pill px-3 py-2 text-sm transition-colors ${
                days === range.days ? 'bg-accent text-bg-1' : 'bg-bg-4 text-text-muted hover:text-text'
              }`}
              onClick={() => setDays(range.days)}
            >
              {range.label}
            </button>
          ))}
          <button type="button" className="btn btn-secondary px-3 py-2 text-sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {!data?.enabled && !isLoading && !error && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          Persistent usage storage is disabled in proxyrs. Live request metrics are still shown on Dashboard; configure
          <code className="mx-1 rounded bg-bg-1 px-1.5 py-0.5">USAGE_DB_PATH</code>
          to retain history between proxy restarts.
        </div>
      )}

      {error ? (
        <div className="card text-sm text-error">Unable to load usage data. Check the proxy connection and try again.</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Requests" value={formatter.format(data?.totals?.requests ?? 0)} />
            <Metric label="Total tokens" value={formatter.format(data?.totals?.total_tokens ?? 0)} />
            <Metric label="Success rate" value={data?.totals?.requests ? `${Math.round((data.totals.ok / data.totals.requests) * 100)}%` : '—'} />
            <Metric label="Local cost estimate" value={formatCost(estimatedCost)} detail={modelsWithRates ? `${modelsWithRates} model${modelsWithRates === 1 ? '' : 's'} with rates` : 'Add rates in Settings'} />
          </div>

          <article className="card">
            <div className="mb-5">
              <h3 className="font-semibold">Requests by day</h3>
              <p className="mt-1 text-sm text-text-muted">Successful and failed requests for the selected range.</p>
            </div>
            {data?.by_day.length ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...data.by_day].reverse()}>
                    <CartesianGrid stroke="#2A3444" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#92929E', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#92929E', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={{ background: '#161D2B', border: '1px solid #2A3444', borderRadius: 8 }} />
                    <Bar dataKey="ok" stackId="requests" fill="#6EE7B7" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="fail" stackId="requests" fill="#F43F5E" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center text-center text-text-muted">
                <BarChart3 className="h-8 w-8" />
                <p className="mt-3 text-sm">No persisted usage data yet.</p>
              </div>
            )}
          </article>

          <article className="card">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">Per-model breakdown</h3>
                <p className="mt-1 text-sm text-text-muted">Today’s recorded model usage and local cost estimates.</p>
              </div>
              <div className="flex gap-2">
                <a className="btn btn-secondary px-3 py-2 text-xs" href={`/api/proxy/export/usage.csv?days=${days}`} download>
                  <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
                </a>
                <a className="btn btn-secondary px-3 py-2 text-xs" href={`/api/proxy/export/usage.json?days=${days}`} download>
                  <FileJson className="h-3.5 w-3.5" /> JSON
                </a>
              </div>
            </div>
            {data?.by_model_today.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                    <tr><th className="py-3">Model</th><th className="py-3 text-right">Requests</th><th className="py-3 text-right">OK</th><th className="py-3 text-right">429</th><th className="py-3 text-right">Tokens</th><th className="py-3 text-right">Local estimate</th><th className="py-3 text-right">Avg latency</th></tr>
                  </thead>
                  <tbody>
                    {data.by_model_today.map((entry) => (
                      <tr className="border-b border-border/60" key={entry.model}>
                        <td className="py-3 font-mono text-xs">{entry.model}</td>
                        <td className="py-3 text-right text-text-muted">{formatter.format(entry.requests)}</td>
                        <td className="py-3 text-right text-success">{formatter.format(entry.ok)}</td>
                        <td className="py-3 text-right text-warning">{formatter.format(entry.rate_limited)}</td>
                        <td className="py-3 text-right text-text-muted">{formatter.format(entry.total_tokens)}</td>
                        <td className="py-3 text-right text-text-muted">{formatCost(estimateCost(entry.total_tokens, costRates[entry.model]))}</td>
                        <td className="py-3 text-right text-text-muted">{entry.latency_ms_avg} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-text-muted">No model records for today.</p>
            )}
          </article>
        </>
      )}

      <p className="flex items-center gap-2 text-xs text-text-muted"><Download className="h-3.5 w-3.5" /> Exports contain aggregate usage only, never prompts or responses. Cost estimates are calculated locally and are not included in proxyrs exports.</p>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <article className="card p-5"><p className="text-sm text-text-muted">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p>{detail && <p className="mt-1 text-xs text-text-muted">{detail}</p>}</article>;
}
