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
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
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
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                      {stat.trend && (
                        <span
                          className={`flex items-center text-xs font-medium ${
                            stat.trend.isPositive ? 'text-emerald-400' : 'text-red-400'
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
                      <p className="text-xs text-slate-500">{stat.description}</p>
                    )}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                    <stat.icon className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
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
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
              <Link
                href="/admin/payments"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-700/50"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}
                  >
                    <activity.icon className={`h-5 w-5 ${activity.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{activity.title}</p>
                    <p className="text-sm text-slate-400">{activity.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    {activity.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Recent Users</CardTitle>
              <Link
                href="/admin/users"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-700">
              {recentUsers.map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-700/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {user.enrolled} enrolled
                    </Badge>
                    <p className="mt-1 text-xs text-slate-500">{user.joined}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Published Courses</p>
                <p className="text-3xl font-bold text-white">9</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                <BookOpen className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">3 drafts</span>
              <Link href="/admin/content" className="text-primary hover:underline">
                Manage →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Published Test Series</p>
                <p className="text-3xl font-bold text-white">6</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                <FileText className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">2 drafts</span>
              <Link href="/admin/content" className="text-primary hover:underline">
                Manage →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Question Bank</p>
                <p className="text-3xl font-bold text-white">2,450</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20">
                <FileText className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-400">+120 this week</span>
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
