'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Activity {
  _id: string;
  actorName: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  entityType: 'course' | 'test_series' | 'exam' | 'question' | 'user';
  entityTitle: string;
  createdAt: string;
}

interface ActivityStats {
  totalToday: number;
  recentActivities: Activity[];
}

// Simple time ago formatter
const formatTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  } catch {
    return 'recently';
  }
};

export function NotificationDropdown() {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/activities/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Pencil className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'publish':
        return <Eye className="h-4 w-4 text-primary" />;
      case 'unpublish':
        return <EyeOff className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getActionText = (activity: Activity) => {
    const actionMap: Record<string, string> = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      publish: 'published',
      unpublish: 'unpublished',
    };

    const entityMap: Record<string, string> = {
      course: 'course',
      test_series: 'test series',
      exam: 'exam',
      question: 'question',
      user: 'user',
    };

    return `${activity.actorName} ${actionMap[activity.action]} ${entityMap[activity.entityType]}`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {stats && stats.totalToday > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {stats.totalToday > 9 ? '9+' : stats.totalToday}
            </span>
          )}
          {!stats && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">
            {stats?.totalToday || 0} activities today
          </p>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="divide-y">
              {stats.recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">{getActionIcon(activity.action)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {getActionText(activity)}
                    </p>
                    <p className="text-sm font-medium truncate text-foreground">
                      {activity.entityTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>

        <div className="border-t p-2">
          <Link href="/admin" onClick={() => setIsOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full">
              View All Activities
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
