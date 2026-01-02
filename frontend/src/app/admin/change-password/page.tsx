'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

export default function ChangePasswordPage() {
  const { user, isAuthenticated, checkAuth, setUser } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      checkAuth();
    }
  }, [isHydrated, checkAuth]);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      window.location.href = '/admin/login';
      return;
    }

    // If user doesn't need to change password, redirect to admin
    if (isHydrated && user && !user.mustChangePassword) {
      window.location.href = '/admin';
    }
  }, [isHydrated, isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from old password');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await authApi.changePassword(oldPassword, newPassword);

      // Update user state to remove mustChangePassword flag
      if (user) {
        setUser({ ...user, mustChangePassword: false });
      }

      setSuccess(true);

      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
            <p className="text-gray-600 mt-1">
              {user.mustChangePassword
                ? 'You must change your password before continuing'
                : 'Update your admin password'}
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Password Changed!</h2>
              <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Old Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all pr-12"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Change Password
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
