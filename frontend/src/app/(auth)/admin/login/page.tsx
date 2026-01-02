'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Shield, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUser, setError, error, isLoading, setLoading, user, isAuthenticated } = useAuthStore();

  // Redirect to admin dashboard ONLY if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'admin' || user.role === 'super_admin')) {
      router.replace('/admin');
    }
  }, [isAuthenticated, user, router]);

  // Step: 'credentials' -> 'otp' -> done
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tempToken, setTempToken] = useState(''); // Temporary token after password verification

  // Step 1: Verify password and send OTP
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // First verify password
      const { data } = await authApi.adminVerifyPassword(email, password);

      if (data.success) {
        // Store temp token (used to verify OTP was requested after password)
        setTempToken(data.data.tempToken);
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete login
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; // Prevent double submission

    setError(null);
    setLoading(true);

    try {
      const { data } = await authApi.adminVerifyOTP(email, otp, tempToken);

      if (data.success) {
        // Save access token
        if (data.data.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
        }

        setUser(data.data.user);

        // Navigate immediately - no setTimeout needed
        if (data.data.user.mustChangePassword) {
          router.replace('/admin/change-password');
        } else {
          router.replace('/admin');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP');
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await authApi.adminVerifyPassword(email, password);
      if (data.success) {
        setTempToken(data.data.tempToken);
        setOtp(''); // Clear the old OTP
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <div className="flex items-center gap-3">
            <Image
              src="/icononly.svg"
              alt="Sivi Academy"
              width={48}
              height={48}
              className="h-12 w-12 object-contain brightness-0 invert"
              priority
            />
            <div>
              <span className="font-bold text-2xl text-white block">SiviAcademy</span>
              <span className="text-slate-400 text-sm">Admin Portal</span>
            </div>
          </div>
        </Link>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Admin Control<br />Center
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Manage courses, users, test series, and analytics from a single dashboard
            </p>
          </div>

          {/* Security Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">Two-Factor Authentication</p>
                <p className="text-sm text-slate-400">Enhanced security with OTP verification</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-white">Secure Access</p>
                <p className="text-sm text-slate-400">Password protected admin accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-white">Role-Based Access</p>
                <p className="text-sm text-slate-400">Admin & Super Admin privileges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-slate-500 text-sm">
            Restricted access - Authorized personnel only
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full" />
        <div className="absolute -left-10 top-1/3 w-40 h-40 bg-purple-500/5 rounded-full" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-900 lg:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <Image
                src="/icononly.svg"
                alt="Sivi Academy"
                width={40}
                height={40}
                className="h-10 w-10 object-contain brightness-0 invert"
                priority
              />
              <div className="text-left">
                <span className="font-bold text-xl text-white block">SiviAcademy</span>
                <span className="text-slate-400 text-sm">Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className={`flex items-center gap-2 ${step === 'credentials' ? 'text-white' : 'text-emerald-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'credentials' ? 'bg-blue-600' : 'bg-emerald-500'
                }`}>
                  {step === 'otp' ? <CheckCircle2 size={16} /> : '1'}
                </div>
                <span className="text-sm hidden sm:inline">Credentials</span>
              </div>
              <div className={`w-12 h-0.5 ${step === 'otp' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <div className={`flex items-center gap-2 ${step === 'otp' ? 'text-white' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'otp' ? 'bg-blue-600' : 'bg-slate-700'
                }`}>
                  2
                </div>
                <span className="text-sm hidden sm:inline">Verify OTP</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-white mb-1">
                {step === 'credentials' ? 'Admin Login' : 'Enter OTP'}
              </h2>
              <p className="text-slate-400 text-sm">
                {step === 'credentials'
                  ? 'Enter your admin credentials'
                  : 'Check your email for the verification code'
                }
              </p>
            </div>

            {step === 'credentials' ? (
              /* Step 1: Email & Password */
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@siviacademy.in"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all text-white placeholder:text-slate-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification */
              <form onSubmit={handleOTPSubmit} className="space-y-5">
                {/* Show where OTP was sent */}
                <div className="p-4 bg-slate-900/50 border border-slate-600 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Mail className="text-blue-400" size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">OTP sent to</p>
                      <p className="font-medium text-white">{email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full px-4 py-4 bg-slate-900/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-slate-600"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    OTP expires in 10 minutes
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Verify & Login
                    </>
                  )}
                </button>

                {/* Resend & Back */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setOtp('');
                      setTempToken('');
                      setError(null);
                    }}
                    className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={16} />
                    Back to login
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-blue-400 text-sm hover:text-blue-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* User Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Not an admin?{' '}
              <Link href="/login" className="text-blue-400 font-medium hover:text-blue-300">
                User Login
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-slate-500 text-sm hover:text-slate-300 transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
