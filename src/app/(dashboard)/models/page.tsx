'use client';

import { Clipboard, LoaderCircle, RotateCcw, Send, TriangleAlert } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { ProxyApiError, proxyApi } from '@/lib/api/proxy';
import { useModels } from '@/lib/hooks/useModels';

const HISTORY_KEY = 'vibeport:prompt-history';

function readHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export default function ModelsPage() {
  const { data: models, error: modelsError, isLoading: modelsLoading } = useModels();
  const [model, setModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [stream, setStream] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  useEffect(() => {
    if (!model && models?.data[0]) setModel(models.data[0].id);
  }, [model, models]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (!model || !prompt.trim() || isSending) return;

    setIsSending(true);
    setResponse('');
    setError(null);
    setElapsed(null);
    const started = performance.now();
    const cleanPrompt = prompt.trim();

    try {
      if (stream) {
        const res = await fetch('/api/proxy/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages: [{ role: 'user', content: cleanPrompt }], stream: true }),
        });
        if (!res.ok) {
          const body = (await res.json()) as { error?: string };
          throw new ProxyApiError(body.error ?? `HTTP ${res.status}`, res.status, '/api/proxy/v1/chat/completions');
        }
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response stream received');
        const decoder = new TextDecoder();
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setResponse(text);
        }
      } else {
        const result = await proxyApi.complete({
          model,
          messages: [{ role: 'user', content: cleanPrompt }],
          stream: false,
        });
        setResponse(JSON.stringify(result, null, 2));
      }

      const nextHistory = [cleanPrompt, ...history.filter((item) => item !== cleanPrompt)].slice(0, 20);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (caught) {
      const apiError = caught instanceof ProxyApiError ? caught : null;
      setError(
        apiError?.status === 429
          ? 'The upstream provider has rate-limited this request (HTTP 429). Wait for the quota to reset or configure another provider.'
          : caught instanceof Error
            ? caught.message
            : 'The request failed unexpectedly.',
      );
    } finally {
      setElapsed(Math.round(performance.now() - started));
      setIsSending(false);
    }
  }

  function onPromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') void send();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <form className="card space-y-5" onSubmit={send}>
        <div>
          <p className="text-sm text-text-muted">Send requests through your local proxyrs instance.</p>
          <h2 className="mt-1 text-2xl font-semibold">Model playground</h2>
        </div>

        <label className="block text-sm font-medium">
          Model
          <select
            className="input mt-2"
            value={model}
            disabled={modelsLoading || Boolean(modelsError)}
            onChange={(event) => setModel(event.target.value)}
          >
            {models?.data.map((entry) => <option key={entry.id} value={entry.id}>{entry.id}</option>)}
          </select>
        </label>
        {modelsError && <p className="text-sm text-error">Could not load models. Check the proxy connection.</p>}

        <label className="block text-sm font-medium">
          Prompt
          <textarea
            className="input mt-2 min-h-44 resize-y font-mono text-sm"
            value={prompt}
            placeholder="Ask anything…"
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={onPromptKeyDown}
          />
          <span className="mt-2 block text-xs text-text-muted">Press Ctrl+Enter to send.</span>
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-text-muted">
          <input type="checkbox" checked={stream} onChange={(event) => setStream(event.target.checked)} />
          Stream raw server-sent events
        </label>

        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary px-4 py-2 text-sm" type="submit" disabled={!model || !prompt.trim() || isSending}>
            {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSending ? 'Sending' : 'Send request'}
          </button>
          <button
            className="btn btn-secondary px-4 py-2 text-sm"
            type="button"
            onClick={() => { setPrompt(''); setResponse(''); setError(null); setElapsed(null); }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        {history.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Recent prompts</p>
            <div className="flex flex-wrap gap-2">
              {history.slice(0, 5).map((item) => (
                <button key={item} type="button" className="max-w-full truncate rounded-pill bg-bg-4 px-3 py-1 text-xs text-text-muted hover:text-text" onClick={() => setPrompt(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      <article className="card flex min-h-[520px] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="font-semibold">Response</h3>
            <p className="mt-1 text-sm text-text-muted">{elapsed === null ? 'Waiting for a request' : `Completed in ${elapsed} ms`}</p>
          </div>
          {response && (
            <button className="btn btn-secondary px-3 py-2 text-xs" type="button" onClick={() => void navigator.clipboard.writeText(response)}>
              <Clipboard className="h-3.5 w-3.5" /> Copy
            </button>
          )}
        </div>

        {error ? (
          <div className="mt-5 flex gap-3 rounded-md border border-error/40 bg-error/10 p-4 text-sm text-error">
            <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : response ? (
          <pre className="mt-5 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-md bg-bg-1 p-4 font-mono text-sm leading-6 text-text">
            {response}
          </pre>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-text-muted">
            Choose a model, enter a prompt, and send your first request.
          </div>
        )}
      </article>
    </section>
  );
}
