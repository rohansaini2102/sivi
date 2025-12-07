'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Plus,
  TrendingUp,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Redirect to change password if required
  useEffect(() => {
    if (user?.mustChangePassword) {
      router.push('/admin/change-password');
    }
  }, [user, router]);

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: Users,
      variant: 'primary' as const,
      trend: { value: 12, isPositive: true },
      description: '+48 this week',
    },
    {
      title: 'Active Courses',
      value: '12',
      icon: BookOpen,
      variant: 'success' as const,
      description: '3 drafts pending',
    },
    {
      title: 'Test Series',
      value: '8',
      icon: FileText,
      variant: 'default' as const,
      description: '156 total exams',
    },
    {
      title: 'Revenue',
      value: '₹45,000',
      icon: IndianRupee,
      variant: 'warning' as const,
      trend: { value: 8, isPositive: true },
      description: 'This month',
    },
  ];

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

  const recentActivity = [
    {
      type: 'user',
      title: 'New user registered',
      subtitle: 'user@example.com',
      time: '2 min ago',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      type: 'enrollment',
      title: 'Course enrollment',
      subtitle: 'Rajasthan GK Complete Course',
      time: '15 min ago',
      icon: BookOpen,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      type: 'test',
      title: 'Test completed',
      subtitle: 'RPSC RAS Mock Test #5',
      time: '1 hour ago',
      icon: FileText,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      type: 'payment',
      title: 'Payment received',
      subtitle: '₹999 - RAS Test Series',
      time: '2 hours ago',
      icon: IndianRupee,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  const recentUsers = [
    { name: 'Rahul Sharma', email: 'rahul@email.com', enrolled: 2, joined: 'Today' },
    { name: 'Priya Singh', email: 'priya@email.com', enrolled: 1, joined: 'Today' },
    { name: 'Amit Kumar', email: 'amit@email.com', enrolled: 3, joined: 'Yesterday' },
    { name: 'Neha Gupta', email: 'neha@email.com', enrolled: 1, joined: 'Yesterday' },
  ];

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
                    <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </div>
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
            <div className="divide-y divide-border">
              {recentUsers.map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-medium text-foreground">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {user.enrolled} enrolled
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{user.joined}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
                <p className="text-3xl font-bold text-foreground">9</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">3 drafts</span>
              <Link href="/admin/content" className="text-primary hover:underline">
                Manage →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published Test Series</p>
                <p className="text-3xl font-bold text-foreground">6</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">2 drafts</span>
              <Link href="/admin/content" className="text-primary hover:underline">
                Manage →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Question Bank</p>
                <p className="text-3xl font-bold text-foreground">2,450</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <FileText className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">+120 this week</span>
              <Link href="/admin/questions" className="text-primary hover:underline">
                Manage →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
