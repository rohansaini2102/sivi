'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  BookOpen,
  FileText,
  Trophy,
  LogOut,
  Settings,
  Bell,
  Search,
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Play,
  Award,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRequireAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { user, isLoading } = useRequireAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Courses Enrolled',
      value: user.stats?.coursesCompleted || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Tests Attempted',
      value: user.stats?.testsAttempted || 0,
      icon: FileText,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Total Points',
      value: user.stats?.totalPoints || 0,
      icon: Trophy,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      label: 'Avg Score',
      value: `${user.stats?.avgScore || 0}%`,
      icon: Target,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
  ];

  const quickActions = [
    {
      label: 'Browse Courses',
      description: 'Explore our course library',
      icon: BookOpen,
      href: '/courses',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Test Series',
      description: 'Practice with mock tests',
      icon: FileText,
      href: '/test-series',
      color: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      label: 'Free Tests',
      description: 'Try free practice tests',
      icon: Play,
      href: '/free-tests',
      color: 'bg-purple-600 hover:bg-purple-700'
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
      iconColor: 'text-emerald-600'
    },
    {
      type: 'course',
      title: 'Rajasthan History - Chapter 5',
      subtitle: 'Completed',
      time: 'Yesterday',
      icon: BookOpen,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      type: 'achievement',
      title: 'First Test Completed',
      subtitle: 'Achievement Unlocked',
      time: '2 days ago',
      icon: Award,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">
                Sivi<span className="text-primary">Academy</span>
              </span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses, tests..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">Student</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user.name?.split(' ')[0]}!</h1>
                  <p className="text-blue-100">Continue your learning journey and ace your exams</p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary font-medium rounded-xl hover:bg-blue-50 transition-colors w-fit"
                >
                  <Play size={18} />
                  Continue Learning
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={stat.textColor} size={20} />
                  </div>
                  <TrendingUp className="text-emerald-500 w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Link
                      href={action.href}
                      className={`${action.color} text-white rounded-xl p-5 flex flex-col h-full transition-all hover:shadow-lg group`}
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                        <action.icon size={20} />
                      </div>
                      <h3 className="font-semibold mb-1">{action.label}</h3>
                      <p className="text-sm text-white/80">{action.description}</p>
                      <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-medium">
                        Explore
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Continue Where You Left */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
                  <Link href="/my-courses" className="text-sm text-primary font-medium hover:text-blue-700">
                    View All
                  </Link>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">Rajasthan GK Complete Course</h3>
                      <p className="text-sm text-gray-500 mb-2">Chapter 5: History of Rajasthan</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">35%</span>
                      </div>
                    </div>
                    <Link
                      href="/courses/rajasthan-gk"
                      className="hidden sm:flex items-center justify-center w-10 h-10 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-primary font-medium hover:text-blue-700">
                  See All
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 ${activity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={activity.iconColor} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.subtitle}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Upcoming Test */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Test</h2>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} />
                    <span className="text-sm text-purple-200">Tomorrow, 10:00 AM</span>
                  </div>
                  <h3 className="font-semibold mb-2">RAS Prelims Full Mock Test</h3>
                  <p className="text-sm text-purple-200 mb-4">150 Questions • 3 Hours</p>
                  <Link
                    href="/test-series/ras-prelims"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Clock size={14} />
                    Set Reminder
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation Links */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/profile" className="text-gray-600 hover:text-primary flex items-center gap-1.5">
                <User size={16} />
                Profile
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-primary flex items-center gap-1.5">
                <Settings size={16} />
                Settings
              </Link>
              <Link href="/analytics" className="text-gray-600 hover:text-primary flex items-center gap-1.5">
                <BarChart3 size={16} />
                Analytics
              </Link>
              <Link href="/" className="text-gray-600 hover:text-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
