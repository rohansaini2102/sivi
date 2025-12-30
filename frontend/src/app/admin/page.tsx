'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Plus,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  HelpCircle,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DashboardData {
  users: {
    total: number;
    newThisWeek: number;
    newThisMonth: number;
    growthPercent: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  testSeries: {
    total: number;
    published: number;
    draft: number;
    totalExams: number;
  };
  payments: {
    total: number;
    completed: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthPercent: number;
  };
  enrollments: {
    total: number;
    active: number;
  };
  questions: {
    total: number;
    addedThisWeek: number;
  };
  recentPayments: Array<{
    _id: string;
    user: { name: string; email: string };
    course?: { title: string };
    testSeries?: { title: string };
    amount: number;
    createdAt: string;
  }>;
  recentEnrollments: Array<{
    _id: string;
    user: { name: string; email: string };
    course?: { title: string };
    testSeries?: { title: string };
    createdAt: string;
  }>;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    enrolledCount: number;
  }>;
}

interface Activity {
  _id: string;
  actorName: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  entityType: 'course' | 'test_series' | 'exam' | 'question' | 'user';
  entityTitle: string;
  createdAt: string;
}

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

// Helper function to format join date
const formatJoinDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to change password if required
  useEffect(() => {
    if (user?.mustChangePassword) {
      router.push('/admin/change-password');
    }
  }, [user, router]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');

      // Fetch dashboard stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activities?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setDashboardData(statsResult.data);
      } else {
        throw new Error(statsResult.error?.message || 'Failed to fetch dashboard data');
      }

      // Handle activities (non-critical, so don't throw on error)
      if (activitiesResponse.ok) {
        const activitiesResult = await activitiesResponse.json();
        if (activitiesResult.success) {
          setActivities(activitiesResult.data.activities || []);
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickActions = [
    {
      label: 'Add Course',
      icon: Plus,
      href: '/admin/content/courses/new',
      color: 'bg-primary hover:bg-primary-dark',
    },
    {
      label: 'Add Test Series',
      icon: Plus,
      href: '/admin/content/test-series/new',
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      label: 'View Users',
      icon: Users,
      href: '/admin/users',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/admin/payments',
      color: 'bg-amber-600 hover:bg-amber-700',
    },
  ];

  // Build stats from real data
  const stats = dashboardData
    ? [
        {
          title: 'Total Users',
          value: dashboardData.users.total.toLocaleString('en-IN'),
          icon: Users,
          variant: 'primary' as const,
          trend: dashboardData.users.growthPercent !== 0
            ? { value: Math.abs(dashboardData.users.growthPercent), isPositive: dashboardData.users.growthPercent >= 0 }
            : undefined,
          description: `+${dashboardData.users.newThisWeek} this week`,
        },
        {
          title: 'Active Courses',
          value: dashboardData.courses.published.toString(),
          icon: BookOpen,
          variant: 'success' as const,
          description: `${dashboardData.courses.draft} drafts pending`,
        },
        {
          title: 'Test Series',
          value: dashboardData.testSeries.published.toString(),
          icon: FileText,
          variant: 'default' as const,
          description: `${dashboardData.testSeries.totalExams} total exams`,
        },
        {
          title: 'Revenue',
          value: formatCurrency(dashboardData.revenue.thisMonth),
          icon: IndianRupee,
          variant: 'warning' as const,
          trend: dashboardData.revenue.growthPercent !== 0
            ? { value: Math.abs(dashboardData.revenue.growthPercent), isPositive: dashboardData.revenue.growthPercent >= 0 }
            : undefined,
          description: 'This month',
        },
      ]
    : [];

  // Helper function to get activity icon and colors
  const getActivityStyle = (action: string) => {
    switch (action) {
      case 'create':
        return { icon: Plus, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' };
      case 'update':
        return { icon: Pencil, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
      case 'delete':
        return { icon: Trash2, iconBg: 'bg-red-100', iconColor: 'text-red-600' };
      case 'publish':
        return { icon: Eye, iconBg: 'bg-primary/10', iconColor: 'text-primary' };
      case 'unpublish':
        return { icon: EyeOff, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' };
      default:
        return { icon: FileText, iconBg: 'bg-muted', iconColor: 'text-muted-foreground' };
    }
  };

  const getEntityLabel = (entityType: string) => {
    switch (entityType) {
      case 'course': return 'course';
      case 'test_series': return 'test series';
      case 'exam': return 'exam';
      case 'question': return 'question';
      default: return entityType;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'created';
      case 'update': return 'updated';
      case 'delete': return 'deleted';
      case 'publish': return 'published';
      case 'unpublish': return 'unpublished';
      default: return action;
    }
  };

  // Build recent activity from ActivityLog
  const recentActivity = activities.map((activity) => {
    const style = getActivityStyle(activity.action);
    return {
      type: 'activity' as const,
      title: `${activity.actorName} ${getActionLabel(activity.action)} ${getEntityLabel(activity.entityType)}`,
      subtitle: activity.entityTitle,
      time: formatTimeAgo(activity.createdAt),
      icon: style.icon,
      iconBg: style.iconBg,
      iconColor: style.iconColor,
    };
  });

  // Build recent users from API data
  const recentUsers = dashboardData?.recentUsers || [];

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-4 p-4 border-b last:border-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Overview Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/content">
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                      {stat.trend && (
                        <span
                          className={`flex items-center text-xs font-medium ${
                            stat.trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {stat.trend.isPositive ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {stat.trend.value}%
                        </span>
                      )}
                    </div>
                    {stat.description && (
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    )}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link
                href={action.href}
                className={`${action.color} flex items-center gap-3 rounded-xl p-4 text-white transition-all hover:shadow-lg`}
              >
                <action.icon className="h-5 w-5" />
                <span className="font-medium">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-border">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}
                    >
                      <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.subtitle}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <HelpCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Recent Users</CardTitle>
              <Link
                href="/admin/users"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentUsers.length > 0 ? (
              <div className="divide-y divide-border">
                {recentUsers.map((recentUser, index) => (
                  <motion.div
                    key={recentUser._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium text-foreground">
                        {recentUser.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{recentUser.name || 'Unknown'}</p>
                      <p className="truncate text-sm text-muted-foreground">{recentUser.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {recentUser.enrolledCount} enrolled
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatJoinDate(recentUser.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No users yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Courses</p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData?.courses.published || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {dashboardData?.courses.draft || 0} drafts
              </span>
              <Link href="/admin/content" className="text-primary hover:underline">
                Manage &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Test Series</p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData?.testSeries.published || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {dashboardData?.testSeries.draft || 0} drafts
              </span>
              <Link href="/admin/content" className="text-primary hover:underline">
                Manage &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Question Bank</p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData?.questions.total.toLocaleString('en-IN') || 0}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <HelpCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                +{dashboardData?.questions.addedThisWeek || 0} this week
              </span>
              <Link href="/admin/question-bank" className="text-primary hover:underline">
                Manage &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
