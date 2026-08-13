'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';

interface SettingsState {
  proxyUrl: string;
  vimitUrl: string;
  theme: Theme;
  costPerThousandTokens: Record<string, number>;
  setProxyUrl: (proxyUrl: string) => void;
  setVimitUrl: (vimitUrl: string) => void;
  setTheme: (theme: Theme) => void;
  setCostRate: (model: string, rate: number) => void;
  reset: () => void;
}

const defaults = {
  proxyUrl: 'http://127.0.0.1:3001',
  vimitUrl: 'http://127.0.0.1:3002',
  theme: 'dark' as Theme,
  costPerThousandTokens: {},
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setProxyUrl: (proxyUrl) => set({ proxyUrl }),
      setVimitUrl: (vimitUrl) => set({ vimitUrl }),
      setTheme: (theme) => set({ theme }),
      setCostRate: (model, rate) =>
        set((state) => ({
          costPerThousandTokens: { ...state.costPerThousandTokens, [model]: rate },
        })),
      reset: () => set(defaults),
    }),
    { name: 'vibeport-settings' },
  ),
);
