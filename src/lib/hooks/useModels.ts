'use client';

import useSWR from 'swr';
import { proxyApi } from '@/lib/api/proxy';
import type { ModelsResponse } from '@/lib/types/proxy';

export function useModels() {
  return useSWR<ModelsResponse>('proxy:models', proxyApi.models, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
}
