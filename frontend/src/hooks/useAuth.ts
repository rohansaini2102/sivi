'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
  requiredRole?: 'user' | 'admin' | 'super_admin';
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    redirectTo = '/login',
    redirectIfFound = false,
    requiredRole,
  } = options;

  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Wait for zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check auth after hydration
  useEffect(() => {
    if (isHydrated) {
      checkAuth().finally(() => {
        setIsReady(true);
      });
    }
  }, [isHydrated, checkAuth]);

  // Handle redirects
  useEffect(() => {
    if (!isReady) return;

    // Redirect if not authenticated (for protected pages)
    if (!redirectIfFound && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Redirect if authenticated (for login/signup pages)
    if (redirectIfFound && isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role requirement
    if (requiredRole && user && user.role !== requiredRole && user.role !== 'super_admin') {
      router.push('/');
      return;
    }
  }, [isReady, isAuthenticated, user, redirectIfFound, redirectTo, requiredRole, router]);

  return {
    user,
    isAuthenticated,
    isLoading: !isReady || isLoading,
    isReady,
  };
}

// Hook for protected pages (redirect to login if not authenticated)
export function useRequireAuth(redirectTo = '/login') {
  return useAuth({ redirectTo, redirectIfFound: false });
}

// Hook for user auth pages (redirect to dashboard if authenticated as user)
export function useRedirectIfAuth(redirectTo = '/dashboard') {
  return useAuth({ redirectTo, redirectIfFound: true });
}

// Hook for admin auth pages (redirect to admin only if authenticated as admin)
export function useRedirectIfAdmin(redirectTo = '/admin') {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      checkAuth().finally(() => {
        setIsReady(true);
      });
    }
  }, [isHydrated, checkAuth]);

  useEffect(() => {
    if (!isReady) return;

    // Only redirect if user is admin or super_admin
    if (isAuthenticated && user && (user.role === 'admin' || user.role === 'super_admin')) {
      router.push(redirectTo);
    }
  }, [isReady, isAuthenticated, user, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading: !isReady || isLoading,
    isReady,
  };
}

// Hook for admin pages
export function useRequireAdmin(redirectTo = '/admin/login') {
  return useAuth({ redirectTo, redirectIfFound: false, requiredRole: 'admin' });
}
