'use client';

import useSWR from 'swr';
import { proxyApi } from '@/lib/api/proxy';
import type { HealthResponse } from '@/lib/types/proxy';

export function useHealth() {
  return useSWR<HealthResponse>('proxy:health', proxyApi.health, {
    refreshInterval: 10_000,
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });
}
