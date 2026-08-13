'use client';

import useSWR from 'swr';
import { proxyApi } from '@/lib/api/proxy';
import type { MetricsSnapshot } from '@/lib/types/proxy';

export function useMetrics(windowMs = 300_000, days = 7) {
  return useSWR<MetricsSnapshot>(
    `proxy:metrics:${windowMs}:${days}`,
    () => proxyApi.metrics(windowMs, days),
    { refreshInterval: 10_000, revalidateOnFocus: true },
  );
}
