'use client';

import { Activity, AlertTriangle, CheckCircle2, RefreshCw, ServerCog, TriangleAlert } from 'lucide-react';
import { useDiag } from '@/lib/hooks/useDiag';
import { useProviders } from '@/lib/hooks/useProviders';
import type { ProxyProvider } from '@/lib/types/proxy';

function providerTone(provider: ProxyProvider): 'success' | 'warning' | 'error' {
  if (provider.circuit.toLowerCase() === 'open') return 'error';
  if (provider.state.toLowerCase() === 'healthy') return 'success';
  return 'warning';
}

function ProviderCard({ provider }: { provider: ProxyProvider }) {
  const tone = providerTone(provider);
  const palette = {
    success: 'border-success/30 bg-success/5 text-success',
    warning: 'border-warning/30 bg-warning/5 text-warning',
    error: 'border-error/30 bg-error/5 text-error',
  };
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'warning' ? AlertTriangle : TriangleAlert;

  return (
    <article className={`rounded-lg border p-5 ${palette[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold">{provider.name}</p>
          <p className="mt-1 break-all text-xs opacity-80">{provider.url}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-xs opacity-70">State</dt><dd className="mt-1 font-medium">{provider.state}</dd></div>
        <div><dt className="text-xs opacity-70">Circuit</dt><dd className="mt-1 font-medium">{provider.circuit}</dd></div>
        <div><dt className="text-xs opacity-70">Requests</dt><dd className="mt-1 font-medium">{provider.total_requests}</dd></div>
        <div><dt className="text-xs opacity-70">Failures</dt><dd className="mt-1 font-medium">{provider.total_failures}</dd></div>
      </dl>
    </article>
  );
}

export default function ProvidersPage() {
  const providers = useProviders();
  const diag = useDiag();
  const refreshing = providers.isLoading || diag.isLoading;
  const unavailable = providers.error || diag.error;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">Circuit breaker and upstream routing status</p>
          <h2 className="mt-1 text-2xl font-semibold">Provider health</h2>
        </div>
        <button
          type="button"
          className="btn btn-secondary px-4 py-2 text-sm"
          onClick={() => { void providers.mutate(); void diag.mutate(); }}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh probe
        </button>
      </div>

      {unavailable ? (
        <div className="card border-error/40 text-sm text-error">Unable to load provider diagnostics. Ensure proxyrs is running.</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric label="Overall health" value={diag.data?.health ?? 'Checking'} icon={Activity} />
            <Metric label="Routing" value={diag.data?.routing ?? '—'} icon={ServerCog} />
            <Metric label="Configured models" value={String(diag.data?.models_count ?? 0)} icon={CheckCircle2} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {providers.data?.providers.map((provider) => <ProviderCard key={provider.name} provider={provider} />)}
          </div>
          {!providers.isLoading && providers.data?.providers.length === 0 && (
            <div className="card text-center text-sm text-text-muted">No upstream providers are configured.</div>
          )}

          <article className="card">
            <h3 className="font-semibold">Current limitations</h3>
            {diag.data?.primary_models.some((model) => model.limited) ? (
              <div className="mt-4 space-y-2">
                {diag.data.primary_models.filter((model) => model.limited).map((model) => (
                  <div className="flex items-center justify-between rounded-md bg-warning/10 px-3 py-2 text-sm text-warning" key={model.model}>
                    <span className="font-mono">{model.model}</span><span>{model.error_type ?? 'Rate limited'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-text-muted">No model-specific limits are reported right now.</p>
            )}
          </article>
        </>
      )}
    </section>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return (
    <article className="card p-5">
      <div className="flex items-center justify-between text-text-muted"><span className="text-sm">{label}</span><Icon className="h-4 w-4" /></div>
      <p className="mt-2 text-2xl font-semibold capitalize">{value}</p>
    </article>
  );
}
