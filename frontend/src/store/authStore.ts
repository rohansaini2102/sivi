import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

interface UserStats {
  coursesCompleted?: number;
  testsAttempted?: number;
  totalPoints?: number;
  avgScore?: number;
}

interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin' | 'super_admin';
  isVerified: boolean;
  mustChangePassword?: boolean;
  language?: 'hi' | 'en';
  avatar?: string;
  stats?: UserStats;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth actions
  sendOTP: (type: 'email' | 'phone', value: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOTP: (type: 'email' | 'phone', value: string, otp: string, name?: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      sendOTP: async (type, value) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.sendOTP(type, value);
          set({ isLoading: false });
          return { success: true, message: data.data.message };
        } catch (error: any) {
          const errorMsg = error.response?.data?.error?.message || 'Failed to send OTP';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      verifyOTP: async (type, value, otp, name) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.verifyOTP(type, value, otp, name);

          // Save access token
          if (data.data.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
          }

          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, isNewUser: data.data.isNewUser };
        } catch (error: any) {
          const errorMsg = error.response?.data?.error?.message || 'Failed to verify OTP';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      adminLogin: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.adminLogin(email, password);

          // Save access token
          if (data.data.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
          }

          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error: any) {
          const errorMsg = error.response?.data?.error?.message || 'Failed to login';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Ignore errors on logout
        }
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        const currentState = get();

        // If no token but we have persisted user, try to refresh
        if (!token && currentState.user) {
          set({ isLoading: true });
          try {
            // Try to refresh using httpOnly cookie
            const { data } = await authApi.refreshToken();
            if (data.data.accessToken) {
              localStorage.setItem('accessToken', data.data.accessToken);
              // Now get user info
              const meResponse = await authApi.getMe();
              set({
                user: meResponse.data.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          } catch (error) {
            // Refresh failed, clear everything
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }
        }

        // No token and no persisted user
        if (!token) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await authApi.getMe();
          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          // If 401, the interceptor will try to refresh
          // If refresh also fails, we'll be redirected
          // Only clear if it's truly an auth error after refresh attempt
          if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            // Network error or other issue - keep the persisted state
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
