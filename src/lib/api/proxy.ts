import type {
  ChatCompletionRequest,
  DiagResponse,
  HealthResponse,
  MetricsSnapshot,
  ModelsResponse,
  ProvidersResponse,
} from '@/lib/types/proxy';

export class ProxyApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = 'ProxyApiError';
    this.status = status;
    this.url = url;
  }
}

function getProxyBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_PROXY_URL?.trim();
  return (configured || 'http://127.0.0.1:3001').replace(/\/+$/, '');
}

export const proxyBaseUrl = getProxyBaseUrl();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${proxyBaseUrl}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Proxy request failed with HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string | { message?: string } };
      if (typeof payload.error === 'string') message = payload.error;
      if (payload.error && typeof payload.error === 'object' && payload.error.message) {
        message = payload.error.message;
      }
    } catch {
      // Keep the status-based message when the proxy does not return JSON.
    }
    throw new ProxyApiError(message, response.status, url);
  }

  return (await response.json()) as T;
}

export const proxyApi = {
  health: () => request<HealthResponse>('/health'),
  models: () => request<ModelsResponse>('/v1/models'),
  metrics: (windowMs = 300_000, days = 7) =>
    request<MetricsSnapshot>(`/metrics?window=${windowMs}&days=${days}`),
  diag: () => request<DiagResponse>('/diag'),
  providers: () => request<ProvidersResponse>('/providers'),
  usage: (days = 7) => request<MetricsSnapshot['usage']>(`/usage?days=${days}`),
  complete: (payload: ChatCompletionRequest) =>
    request<unknown>('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};

export function proxyFetcher<T>(path: string): Promise<T> {
  return request<T>(path);
}
