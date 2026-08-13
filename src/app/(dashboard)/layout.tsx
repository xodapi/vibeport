import { MobileNavigation, Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-1">
      <Sidebar />
      <div className="min-h-screen md:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl p-5 pb-24 md:p-8">{children}</main>
      </div>
      <MobileNavigation />
    </div>
  );
}
