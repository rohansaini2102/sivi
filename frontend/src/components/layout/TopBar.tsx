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
import { GlobalSearchDropdown } from '@/components/admin/GlobalSearchDropdown';
import { NotificationDropdown } from '@/components/admin/NotificationDropdown';

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
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6"
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search */}
      {showSearch && (
        <div className="hidden flex-1 md:flex md:max-w-md">
          {variant === 'admin' ? (
            <GlobalSearchDropdown className="w-full" />
          ) : (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses, tests..."
                className="w-full pl-10"
              />
            </div>
          )}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        {variant === 'admin' ? (
          <NotificationDropdown />
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            <span className="sr-only">Notifications</span>
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
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
