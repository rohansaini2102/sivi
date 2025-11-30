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
  Settings,
  LogOut,
  Shield,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRequireAdmin } from '@/hooks/useAuth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { user, isLoading } = useRequireAdmin();

  // Redirect to change password if required
  useEffect(() => {
    if (user?.mustChangePassword) {
      router.push('/admin/change-password');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Show loading while checking auth or if password change required
  if (isLoading || !user || user.mustChangePassword) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Courses', value: '12', icon: BookOpen, color: 'bg-green-500' },
    { label: 'Test Series', value: '8', icon: FileText, color: 'bg-purple-500' },
    { label: 'Revenue', value: '₹45,000', icon: TrendingUp, color: 'bg-yellow-500' },
  ];

  const quickActions = [
    { label: 'Add Course', icon: Plus, href: '/admin/courses/new', color: 'bg-blue-600' },
    { label: 'Add Test Series', icon: Plus, href: '/admin/test-series/new', color: 'bg-green-600' },
    { label: 'View Users', icon: Users, href: '/admin/users', color: 'bg-purple-600' },
    { label: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-bold">SiviAcademy</h1>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800 text-white"
          >
            <BarChart3 size={20} />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Users size={20} />
            Users
          </Link>
          <Link
            href="/admin/courses"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <BookOpen size={20} />
            Courses
          </Link>
          <Link
            href="/admin/test-series"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FileText size={20} />
            Test Series
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors w-full"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-slate-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`${action.color} text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity`}
              >
                <action.icon size={24} />
                <span className="font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-slate-800">New user registered</p>
                <p className="text-sm text-slate-500">user@example.com</p>
              </div>
              <span className="text-sm text-slate-500">2 min ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-slate-800">Course enrollment</p>
                <p className="text-sm text-slate-500">Rajasthan GK Complete Course</p>
              </div>
              <span className="text-sm text-slate-500">15 min ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="text-purple-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-slate-800">Test completed</p>
                <p className="text-sm text-slate-500">RPSC RAS Mock Test #5</p>
              </div>
              <span className="text-sm text-slate-500">1 hour ago</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
