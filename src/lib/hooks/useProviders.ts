'use client';

import useSWR from 'swr';
import { proxyApi } from '@/lib/api/proxy';
import type { ProvidersResponse } from '@/lib/types/proxy';

export function useProviders() {
  return useSWR<ProvidersResponse>('proxy:providers', proxyApi.providers, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });
}
