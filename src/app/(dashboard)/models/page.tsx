'use client';

import { BookmarkPlus, Clipboard, LoaderCircle, RotateCcw, Send, Trash2, TriangleAlert } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { ProxyApiError, proxyApi } from '@/lib/api/proxy';
import { useModels } from '@/lib/hooks/useModels';
import { extractOpenAiCompletionText, extractOpenAiTextDelta } from '@/lib/utils/sse';

const HISTORY_KEY = 'vibeport:prompt-history';
const SAVED_PROMPTS_KEY = 'vibeport:saved-prompts';

interface ComparisonResult {
  model: string;
  response: string;
  error: string | null;
  elapsed: number | null;
}

function readHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function readSavedPrompts(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_PROMPTS_KEY) ?? '[]') as string[];
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
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [stream, setStream] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonModel, setComparisonModel] = useState('');
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(readHistory());
    setSavedPrompts(readSavedPrompts());
  }, []);

  useEffect(() => {
    if (!model && models?.data[0]) setModel(models.data[0].id);
  }, [model, models]);

  useEffect(() => {
    if (!comparisonModel && models?.data[1]) setComparisonModel(models.data[1].id);
  }, [comparisonModel, models]);

  function messageForError(caught: unknown) {
    const apiError = caught instanceof ProxyApiError ? caught : null;
    return apiError?.status === 429
      ? 'The upstream provider rate-limited this request (HTTP 429).'
      : caught instanceof Error
        ? caught.message
        : 'The request failed unexpectedly.';
  }

  async function send(event?: FormEvent) {
    event?.preventDefault();
    if (!model || !prompt.trim() || isSending) return;

    setIsSending(true);
    setResponse('');
    setError(null);
    setElapsed(null);
    setComparisonResults([]);
    const started = performance.now();
    const cleanPrompt = prompt.trim();

    try {
      if (comparisonMode) {
        const compareModels = [model, comparisonModel].filter((value, index, values) => value && values.indexOf(value) === index);
        const results = await Promise.all(compareModels.map(async (selectedModel): Promise<ComparisonResult> => {
          const compareStarted = performance.now();
          try {
            const result = await proxyApi.complete({
              model: selectedModel,
              messages: [{ role: 'user', content: cleanPrompt }],
              stream: false,
            });
            return {
              model: selectedModel,
              response: extractOpenAiCompletionText(result) ?? JSON.stringify(result, null, 2),
              error: null,
              elapsed: Math.round(performance.now() - compareStarted),
            };
          } catch (caught) {
            return { model: selectedModel, response: '', error: messageForError(caught), elapsed: Math.round(performance.now() - compareStarted) };
          }
        }));
        setComparisonResults(results);
        const nextHistory = [cleanPrompt, ...history.filter((item) => item !== cleanPrompt)].slice(0, 20);
        setHistory(nextHistory);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
        return;
      }

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
        let rawText = '';
        let parsedText = '';
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split(/\n\n/);
          buffer = frames.pop() ?? '';
          for (const frame of frames) {
            rawText += `${frame}\n\n`;
            const delta = extractOpenAiTextDelta(frame);
            if (delta === null) {
              parsedText = rawText;
              continue;
            }
            parsedText += delta;
          }
          setResponse(parsedText || rawText);
        }
        if (buffer) {
          rawText += buffer;
          const delta = extractOpenAiTextDelta(buffer);
          setResponse(delta === null ? rawText : `${parsedText}${delta}`);
        }
      } else {
        const result = await proxyApi.complete({
          model,
          messages: [{ role: 'user', content: cleanPrompt }],
          stream: false,
        });
        setResponse(extractOpenAiCompletionText(result) ?? JSON.stringify(result, null, 2));
      }

      const nextHistory = [cleanPrompt, ...history.filter((item) => item !== cleanPrompt)].slice(0, 20);
      setHistory(nextHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (caught) {
      setError(messageForError(caught));
    } finally {
      setElapsed(Math.round(performance.now() - started));
      setIsSending(false);
    }
  }

  function onPromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') void send();
  }

  function savePrompt() {
    const clean = prompt.trim();
    if (!clean) return;
    const next = [clean, ...savedPrompts.filter((item) => item !== clean)].slice(0, 20);
    setSavedPrompts(next);
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(next));
  }

  function removeSavedPrompt(promptToRemove: string) {
    const next = savedPrompts.filter((item) => item !== promptToRemove);
    setSavedPrompts(next);
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(next));
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
          <input type="checkbox" checked={stream} disabled={comparisonMode} onChange={(event) => setStream(event.target.checked)} />
          Stream response
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-text-muted">
          <input type="checkbox" checked={comparisonMode} onChange={(event) => setComparisonMode(event.target.checked)} />
          Compare two models (non-streaming)
        </label>
        {comparisonMode && (
          <label className="block text-sm font-medium">
            Comparison model
            <select className="input mt-2" value={comparisonModel} onChange={(event) => setComparisonModel(event.target.value)}>
              {models?.data.map((entry) => <option key={entry.id} value={entry.id} disabled={entry.id === model}>{entry.id}</option>)}
            </select>
          </label>
        )}

        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary px-4 py-2 text-sm" type="submit" disabled={!model || !prompt.trim() || isSending || (comparisonMode && !comparisonModel)}>
            {isSending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSending ? 'Sending' : comparisonMode ? 'Compare models' : 'Send request'}
          </button>
          <button
            className="btn btn-secondary px-4 py-2 text-sm"
            type="button"
            onClick={() => { setPrompt(''); setResponse(''); setError(null); setElapsed(null); setComparisonResults([]); }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button className="btn btn-secondary px-4 py-2 text-sm" type="button" disabled={!prompt.trim()} onClick={savePrompt}>
            <BookmarkPlus className="h-4 w-4" /> Save prompt
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
        {savedPrompts.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Saved prompts</p>
            <ul className="space-y-2">
              {savedPrompts.map((item) => (
                <li className="flex items-center gap-2 rounded-md bg-bg-4 p-2" key={item}>
                  <button type="button" className="min-w-0 flex-1 truncate text-left text-xs text-text-muted hover:text-text" onClick={() => setPrompt(item)}>{item}</button>
                  <button type="button" className="rounded p-1 text-text-muted hover:bg-bg-5 hover:text-error focus:outline-none focus:ring-2 focus:ring-accent" aria-label="Delete saved prompt" onClick={() => removeSavedPrompt(item)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      <article className="card flex min-h-[520px] flex-col">
        <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="font-semibold">{comparisonMode ? 'Comparison' : 'Response'}</h3>
            <p className="mt-1 text-sm text-text-muted">{comparisonMode ? 'The same prompt is sent to both models concurrently.' : elapsed === null ? 'Waiting for a request' : `Completed in ${elapsed} ms`}</p>
          </div>
          {response && (
            <button className="btn btn-secondary px-3 py-2 text-xs" type="button" onClick={() => void navigator.clipboard.writeText(response)}>
              <Clipboard className="h-3.5 w-3.5" /> Copy
            </button>
          )}
        </div>

        {comparisonMode && comparisonResults.length > 0 ? (
          <div className="mt-5 grid flex-1 gap-4 lg:grid-cols-2">
            {comparisonResults.map((result) => (
              <section className="flex min-h-0 flex-col rounded-md border border-border bg-bg-1 p-4" key={result.model} aria-label={`${result.model} result`}>
                <div className="mb-3 border-b border-border pb-3"><h4 className="truncate font-mono text-xs text-text">{result.model}</h4><p className="mt-1 text-xs text-text-muted">{result.elapsed} ms</p></div>
                {result.error ? <p className="text-sm text-error">{result.error}</p> : <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-text">{result.response}</pre>}
              </section>
            ))}
          </div>
        ) : error ? (
          <div className="mt-5 flex gap-3 rounded-md border border-error/40 bg-error/10 p-4 text-sm text-error">
            <TriangleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        ) : response ? (
          <pre className="mt-5 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-md bg-bg-1 p-4 font-mono text-sm leading-6 text-text" aria-live="polite">
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
