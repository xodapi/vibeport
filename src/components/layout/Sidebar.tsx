'use client';

import {
  Activity,
  BarChart3,
  Bot,
  ExternalLink,
  LayoutDashboard,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/models', label: 'Models', icon: Bot },
  { href: '/usage', label: 'Usage', icon: BarChart3 },
  { href: '/providers', label: 'Providers', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
              active
                ? 'bg-accent/15 text-accent'
                : 'text-text-muted hover:bg-bg-4 hover:text-text'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-bg-2/95 px-1 py-2 backdrop-blur md:hidden"
    >
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-accent ${
              active ? 'text-accent' : 'text-text-muted'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg-3 text-text shadow-md md:hidden"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-bg-2 p-4 transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-accent to-success text-sm font-bold text-bg-1">
            V
          </span>
          <span>
            <span className="block text-base font-semibold text-text">VibePort</span>
            <span className="block text-xs text-text-muted">LLM control center</span>
          </span>
        </Link>

        <NavigationLinks onNavigate={() => setIsOpen(false)} />

        <div className="mt-auto border-t border-border pt-4">
          <Link
            href="https://github.com/xodapi/vibeport"
            target="_blank"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:bg-bg-4 hover:text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            View on GitHub
          </Link>
        </div>
      </aside>
    </>
  );
}
