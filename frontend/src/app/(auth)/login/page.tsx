'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Phone, ArrowRight, Loader2, ArrowLeft, CheckCircle2, BookOpen, Users, Award } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRedirectIfAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP, isLoading, error, setError } = useAuthStore();

  // Redirect to dashboard if already logged in
  const { isLoading: authLoading } = useRedirectIfAuth('/dashboard');

  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await sendOTP(loginType, inputValue);
    if (result.success) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await verifyOTP(loginType, inputValue, otp, name || undefined);
    if (result.success) {
      router.push('/dashboard');
    } else if (result.error?.includes('Name is required') || result.isNewUser) {
      setShowNameInput(true);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    await sendOTP(loginType, inputValue);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
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
            <span className="font-bold text-2xl text-white">
              SiviAcademy
            </span>
          </div>
        </Link>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Crack Rajasthan<br />Govt Exams
            </h1>
            <p className="text-blue-100 text-lg">
              Join 50,000+ students preparing for RAS, REET, Patwar, Police & RPSC exams
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Structured Courses</p>
                <p className="text-sm text-blue-200">Complete syllabus coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Expert Faculty</p>
                <p className="text-sm text-blue-200">Learn from the best teachers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">92% Success Rate</p>
                <p className="text-sm text-blue-200">Proven results</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="relative z-10">
          <p className="text-blue-200 text-sm">
            Trusted by students across Rajasthan since 2020
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -right-10 top-20 w-40 h-40 bg-white/5 rounded-full" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/icononly.svg"
                alt="Sivi Academy"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
              <span className="font-bold text-xl text-gray-900">
                Sivi<span className="text-primary">Academy</span>
              </span>
            </Link>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'input' ? 'Welcome Back' : 'Verify OTP'}
            </h2>
            <p className="text-gray-600">
              {step === 'input'
                ? 'Login or create account to continue'
                : `We've sent a 6-digit code to ${loginType === 'email' ? 'your email' : 'your phone'}`
              }
            </p>
          </div>

          {step === 'input' ? (
            <>
              {/* Login Type Toggle */}
              <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('email');
                    setInputValue('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    loginType === 'email'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Mail size={16} />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('phone');
                    setInputValue('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    loginType === 'phone'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Phone size={16} />
                  Phone
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {loginType === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {loginType === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                    </div>
                    <input
                      type={loginType === 'email' ? 'email' : 'tel'}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        loginType === 'email'
                          ? 'name@example.com'
                          : '9876543210'
                      }
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Terms */}
              <p className="text-xs text-gray-500 mt-6 text-center">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </>
          ) : (
            /* OTP Form */
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              {/* Show where OTP was sent */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {loginType === 'email' ? <Mail className="text-primary" size={18} /> : <Phone className="text-primary" size={18} />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">OTP sent to</p>
                    <p className="font-medium text-gray-900">{inputValue}</p>
                  </div>
                </div>
              </div>

              {showNameInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required={showNameInput}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be your display name</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  required
                  autoFocus={!showNameInput}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  OTP expires in 10 minutes
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Verify & Continue
                  </>
                )}
              </button>

              {/* Resend & Back */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setOtp('');
                    setShowNameInput(false);
                    setError(null);
                  }}
                  className="text-gray-600 text-sm hover:text-gray-800 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  Change {loginType}
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-primary text-sm hover:text-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-700 transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
