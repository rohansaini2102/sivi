'use client';

import { useState } from 'react';
import { useRequireAdmin } from '@/hooks/useAuth';
import { AdminSidebar, TopBar } from '@/components/layout';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-8 w-48 mx-auto bg-slate-700" />
          <Skeleton className="h-4 w-64 mx-auto bg-slate-700" />
          <div className="flex justify-center gap-2 pt-4">
            <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
            <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
            <Skeleton className="h-10 w-10 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-0">
          <AdminSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
        {/* Top Bar */}
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          variant="admin"
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
