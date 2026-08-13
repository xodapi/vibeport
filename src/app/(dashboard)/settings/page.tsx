'use client';

import { CheckCircle2, RotateCcw, Save, Settings2, TriangleAlert } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useModels } from '@/lib/hooks/useModels';
import { Theme, useSettingsStore } from '@/lib/stores/settings';

const themes: Theme[] = ['dark', 'light', 'system'];

export default function SettingsPage() {
  const settings = useSettingsStore();
  const { data: models } = useModels();
  const [proxyUrl, setProxyUrl] = useState(settings.proxyUrl);
  const [vimitUrl, setVimitUrl] = useState(settings.vimitUrl);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const resolved = settings.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : settings.theme;
    root.classList.toggle('dark', resolved === 'dark');
  }, [settings.theme]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch('/api/settings/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxyUrl }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Could not save proxy URL');

      const health = await fetch('/api/proxy/health', { cache: 'no-store' });
      if (!health.ok) throw new Error('Proxy URL saved, but the health check failed.');

      settings.setProxyUrl(proxyUrl.replace(/\/+$/, ''));
      settings.setVimitUrl(vimitUrl.replace(/\/+$/, ''));
      setStatus({ ok: true, message: 'Settings saved. The proxy connection is healthy.' });
    } catch (error) {
      setStatus({ ok: false, message: error instanceof Error ? error.message : 'Unable to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    settings.reset();
    setProxyUrl('http://127.0.0.1:3001');
    setVimitUrl('http://127.0.0.1:3002');
    setStatus(null);
  }

  return (
    <section className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-text-muted">Preferences are stored locally in this browser.</p>
        <h2 className="mt-1 text-2xl font-semibold">Settings</h2>
      </div>

      <form className="space-y-6" onSubmit={save}>
        <article className="card space-y-4">
          <div><h3 className="font-semibold">Connections</h3><p className="mt-1 text-sm text-text-muted">VibePort only accepts localhost proxy targets for safety.</p></div>
          <label className="block text-sm font-medium">proxyrs URL<input className="input mt-2" value={proxyUrl} onChange={(event) => setProxyUrl(event.target.value)} /></label>
          <label className="block text-sm font-medium">vimit URL <span className="font-normal text-text-muted">(reserved for future integration)</span><input className="input mt-2" value={vimitUrl} onChange={(event) => setVimitUrl(event.target.value)} /></label>
        </article>

        <article className="card space-y-4">
          <div><h3 className="font-semibold">Appearance</h3><p className="mt-1 text-sm text-text-muted">Choose how VibePort follows your preferred color scheme.</p></div>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => <button key={theme} type="button" onClick={() => settings.setTheme(theme)} className={`rounded-pill px-4 py-2 text-sm capitalize ${settings.theme === theme ? 'bg-accent text-bg-1' : 'bg-bg-4 text-text-muted hover:text-text'}`}>{theme}</button>)}
          </div>
        </article>

        <article className="card space-y-4">
          <div><h3 className="font-semibold">Cost estimates</h3><p className="mt-1 text-sm text-text-muted">Optional local rates, per 1,000 tokens. They will be used in analytics estimates.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {models?.data.map((model) => (
              <label key={model.id} className="text-sm font-medium">
                <span className="block truncate font-mono text-xs">{model.id}</span>
                <input className="input mt-2" min="0" step="0.0001" type="number" value={settings.costPerThousandTokens[model.id] ?? ''} placeholder="0.0000" onChange={(event) => settings.setCostRate(model.id, Number(event.target.value) || 0)} />
              </label>
            ))}
          </div>
        </article>

        {status && (
          <div className={`flex gap-3 rounded-lg border p-4 text-sm ${status.ok ? 'border-success/40 bg-success/10 text-success' : 'border-error/40 bg-error/10 text-error'}`}>
            {status.ok ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <TriangleAlert className="h-5 w-5 shrink-0" />}<span>{status.message}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary px-4 py-2 text-sm" disabled={saving}><Save className="h-4 w-4" />{saving ? 'Saving' : 'Save and test connection'}</button>
          <button type="button" className="btn btn-secondary px-4 py-2 text-sm" onClick={reset}><RotateCcw className="h-4 w-4" />Reset defaults</button>
        </div>
      </form>
      <p className="flex items-center gap-2 text-xs text-text-muted"><Settings2 className="h-3.5 w-3.5" /> API keys are never stored by VibePort.</p>
    </section>
  );
}
