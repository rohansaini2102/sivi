'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  HelpCircle,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Hammer,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Content',
    href: '/admin/content',
    icon: FolderOpen,
    description: 'Create & manage courses/test series',
  },
  {
    title: 'Course Builder',
    href: '/admin/course-builder',
    icon: Hammer,
    description: 'Build course content (subjects, chapters, lessons)',
  },
  {
    title: 'Test Series Builder',
    href: '/admin/test-series-builder',
    icon: ClipboardList,
    description: 'Build test series with exams and sections',
  },
  {
    title: 'Question Bank',
    href: '/admin/question-bank',
    icon: HelpCircle,
    description: 'Manage quiz questions',
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          collapsed ? 'flex-col justify-center gap-1 px-2 py-2' : 'justify-between px-4'
        )}
      >
        <Link href="/admin" className="flex items-center gap-2">
          {!collapsed ? (
            <>
              <Image
                src="/fulllogo.svg"
                alt="SiviAcademy"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span className="text-xs text-muted-foreground">Admin</span>
            </>
          ) : (
            <Image
              src="/icononly.svg"
              alt="SiviAcademy"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
          )}
        </Link>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-border p-3">
        {!collapsed && user && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
