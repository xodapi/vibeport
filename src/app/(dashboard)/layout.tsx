import { MobileNavigation, Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-1">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar />
      <div className="min-h-screen md:pl-64">
        <TopBar />
        <main id="main-content" className="mx-auto w-full max-w-7xl p-5 pb-24 md:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
