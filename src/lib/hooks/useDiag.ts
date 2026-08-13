'use client';

import useSWR from 'swr';
import { proxyApi } from '@/lib/api/proxy';
import type { DiagResponse } from '@/lib/types/proxy';

export function useDiag() {
  return useSWR<DiagResponse>('proxy:diag', proxyApi.diag, {
    refreshInterval: 15_000,
    revalidateOnFocus: true,
  });
}
