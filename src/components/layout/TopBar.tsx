'use client';

import { Circle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useHealth } from '@/lib/hooks/useHealth';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/models': 'Model Playground',
  '/usage': 'Usage Analytics',
  '/providers': 'Provider Health',
  '/settings': 'Settings',
};

export function TopBar() {
  const pathname = usePathname();
  const { data, error, isLoading } = useHealth();
  const title = pageTitles[pathname] ?? 'VibePort';
  const healthy = data?.status === 'ok' && !error;
  const statusLabel = isLoading ? 'Checking proxy' : healthy ? 'Proxy online' : 'Proxy unavailable';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-bg-1/90 px-5 backdrop-blur md:px-8">
      <h1 className="ml-12 text-lg font-semibold md:ml-0">{title}</h1>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-2 rounded-pill border border-border bg-bg-3 px-3 py-1.5 text-xs text-text-muted"
          title={statusLabel}
          role="status"
          aria-live="polite"
        >
          <Circle
            className={`h-2.5 w-2.5 fill-current ${
              isLoading ? 'animate-pulse text-warning' : healthy ? 'text-success' : 'text-error'
            }`}
            aria-hidden="true"
          />
          <span>{statusLabel}</span>
        </span>
        <span className="hidden rounded-pill border border-border bg-bg-3 px-3 py-1.5 text-xs text-text-muted sm:inline">
          v0.3.0
        </span>
      </div>
    </header>
  );
}
