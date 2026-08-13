'use client';

import useSWR from 'swr';
import { proxyApi } from '@/lib/api/proxy';
import type { UsageData } from '@/lib/types/proxy';

export function useUsage(days = 7) {
  return useSWR<UsageData>(`proxy:usage:${days}`, () => proxyApi.usage(days), {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });
}
