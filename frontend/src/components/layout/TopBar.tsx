'use client';

import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  variant?: 'user' | 'admin';
}

export function TopBar({ onMenuClick, showSearch = true, variant = 'user' }: TopBarProps) {
  const { user, logout } = useAuthStore();

  const getInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.split(' ');
    const first = parts[0]?.[0] || '';
    const last = parts[1]?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 md:px-6',
        variant === 'admin'
          ? 'border-slate-700 bg-slate-900'
          : 'border-border bg-card'
      )}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'md:hidden',
          variant === 'admin' && 'text-slate-400 hover:text-white hover:bg-slate-800'
        )}
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search */}
      {showSearch && (
        <div className="hidden flex-1 md:flex md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search courses, tests..."
              className={cn(
                'w-full pl-10',
                variant === 'admin' &&
                  'border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-primary'
              )}
            />
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative',
            variant === 'admin' && 'text-slate-400 hover:text-white hover:bg-slate-800'
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  className={cn(
                    variant === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || user?.phone}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={variant === 'admin' ? '/admin/settings' : '/dashboard/profile'}>
                Profile & Settings
              </Link>
            </DropdownMenuItem>
            {variant === 'user' && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/orders">My Orders</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-destructive focus:text-destructive"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
