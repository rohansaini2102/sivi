'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Trophy,
  Target,
  ChevronRight,
  Clock,
  Play,
  Award,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/layout';
import { StatCard } from '@/components/cards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Courses Enrolled',
      value: user?.stats?.coursesCompleted || 0,
      icon: BookOpen,
      variant: 'primary' as const,
    },
    {
      title: 'Tests Attempted',
      value: user?.stats?.testsAttempted || 0,
      icon: FileText,
      variant: 'success' as const,
    },
    {
      title: 'Total Points',
      value: user?.stats?.totalPoints || 0,
      icon: Trophy,
      variant: 'warning' as const,
    },
    {
      title: 'Avg Score',
      value: `${user?.stats?.avgScore || 0}%`,
      icon: Target,
      variant: 'default' as const,
    },
  ];

  const quickActions = [
    {
      label: 'Browse Courses',
      description: 'Explore our course library',
      icon: BookOpen,
      href: '/courses',
      color: 'bg-primary hover:bg-primary-dark',
    },
    {
      label: 'Test Series',
      description: 'Practice with mock tests',
      icon: FileText,
      href: '/test-series',
      color: 'bg-emerald-600 hover:bg-emerald-700',
    },
    {
      label: 'My Results',
      description: 'View your performance',
      icon: Target,
      href: '/dashboard/performance',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  const recentActivity = [
    {
      type: 'test',
      title: 'RAS Prelims Mock Test #3',
      subtitle: 'Score: 72/100',
      time: '2 hours ago',
      icon: FileText,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      type: 'course',
      title: 'Rajasthan History - Chapter 5',
      subtitle: 'Completed',
      time: 'Yesterday',
      icon: BookOpen,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      type: 'achievement',
      title: 'First Test Completed',
      subtitle: 'Achievement Unlocked',
      time: '2 days ago',
      icon: Award,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-primary p-6 text-primary-foreground"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="mt-1 text-primary-foreground/80">
              Continue your learning journey and ace your exams
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-fit bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/courses">
              <Play className="mr-2 h-4 w-4" />
              Continue Learning
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Quick Actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    href={action.href}
                    className={`${action.color} flex h-full flex-col rounded-xl p-5 text-white transition-all hover:shadow-lg`}
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">{action.label}</h3>
                    <p className="mt-1 text-sm text-white/80">
                      {action.description}
                    </p>
                    <div className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium">
                      Explore
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Continue Learning */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Continue Learning</CardTitle>
                <Link
                  href="/dashboard/courses"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-foreground">
                    Rajasthan GK Complete Course
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Chapter 5: History of Rajasthan
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={35} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-muted-foreground">
                      35%
                    </span>
                  </div>
                </div>
                <Button size="icon" className="hidden sm:flex" asChild>
                  <Link href="/dashboard/courses/1">
                    <Play className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Link
                  href="/dashboard/performance"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}
                    >
                      <activity.icon
                        className={`h-4 w-4 ${activity.iconColor}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.subtitle}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Test */}
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2 text-purple-200">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Tomorrow, 10:00 AM</span>
              </div>
              <h3 className="mb-2 font-semibold">RAS Prelims Full Mock Test</h3>
              <p className="mb-4 text-sm text-purple-200">
                150 Questions • 3 Hours
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <Clock className="mr-2 h-4 w-4" />
                Set Reminder
              </Button>
            </CardContent>
          </Card>

          {/* Shop CTA */}
          <Card className="border-dashed">
            <CardContent className="p-5 text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground">
                Explore More Courses
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover new courses and test series to boost your preparation
              </p>
              <Button className="mt-4 w-full" asChild>
                <Link href="/courses">
                  Browse Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
