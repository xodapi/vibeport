export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down' | string;
}

export interface ProxyModel {
  id: string;
  object: 'model' | string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: 'list' | string;
  data: ProxyModel[];
}

export interface UsageSummary {
  requests: number;
  ok: number;
  fail: number;
  rate_limited: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms_avg: number;
  latency_ms_max: number;
  tokens_per_minute: number;
  requests_per_minute: number;
  uptime_seconds: number | null;
  cost: number;
}

export interface TimeSeriesPoint {
  bucket: string;
  requests: number;
  ok: number;
  fail: number;
  rate_limited: number;
  total_tokens: number;
}

export interface RecentRequest {
  timestamp?: string;
  model?: string;
  status?: number;
  latency_ms?: number;
  total_tokens?: number;
  error_type?: string | null;
}

export interface ModelStatus {
  model: string;
  state: string;
  last_seen_ts: number | null;
  rate_limit_remaining: number | null;
  rate_limit_limit: number | null;
  limited: boolean;
  error_type: string | null;
  last_status: number | null;
  today: UsageSummary | null;
  previous_day: UsageSummary | null;
}

export interface MetricsSnapshot {
  version: 1;
  generated_at: string;
  started_at: string;
  uptime_seconds: number;
  window_ms: number;
  total_events_kept: number;
  summary: {
    all: UsageSummary;
    window: UsageSummary;
  };
  timeseries: TimeSeriesPoint[];
  limits: LimitStatus[];
  model_status: {
    primary: ModelStatus[];
    all: ModelStatus[];
  };
  usage: UsageData;
  recent: RecentRequest[];
  privacy: {
    stores_prompts: boolean;
    stores_responses: boolean;
    stores_api_keys: boolean;
    note: string;
  };
  routing: string;
  app: string;
  app_version: string;
}

export interface ProviderStatus {
  name: string;
  url: string;
  state: string;
  circuit: string;
  total_requests: number;
  total_failures: number;
}

export interface LimitStatus {
  model: string;
  limited: boolean;
  rate_limit_remaining: number | null;
  rate_limit_limit: number | null;
  reset_at: string | null;
  reset_in_seconds: number | null;
  error_type: string | null;
}

export interface UsageData {
  enabled: boolean;
  path: string | null;
  today: string;
  totals: UsageSummary | null;
  by_day: Array<Record<string, unknown>>;
  by_model_today: Array<Record<string, unknown>>;
  by_model_24h: Array<Record<string, unknown>>;
}

export interface DiagResponse {
  version: string;
  app: string;
  uptime_seconds: number;
  uptime_human: string;
  generated_at: string;
  routing: string;
  providers: ProviderStatus[];
  models_count: number;
  primary_models_count: number;
  primary_models: ModelStatus[];
  window_5min: UsageSummary;
  health: string;
  errors: string[];
}

export interface ProxyProvider {
  name: string;
  base_url: string;
  models: string[];
  healthy: boolean;
}

export interface ProvidersResponse {
  providers: ProxyProvider[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | string;
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ProxyError {
  error: string | { message?: string; type?: string; code?: string | number };
}
