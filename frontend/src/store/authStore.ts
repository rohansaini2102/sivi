import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

// Track network errors for stale state handling
let networkErrorCount = 0;

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

          // Save tokens
          if (data.data.accessToken) {
            localStorage.setItem('accessToken', data.data.accessToken);
          }
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
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
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          const token = localStorage.getItem('accessToken');
          const currentState = get();

          // If no token but we have persisted user, try to refresh
          if (!token && currentState.user) {
            try {
              // Try to refresh using httpOnly cookie
              const { data } = await authApi.refreshToken();
              if (data.data.accessToken) {
                localStorage.setItem('accessToken', data.data.accessToken);
                // Now get user info
                const meResponse = await authApi.getMe();
                networkErrorCount = 0; // Reset on success
                set({
                  user: meResponse.data.data.user,
                  isAuthenticated: true,
                  isLoading: false,
                });
                return;
              }
            } catch {
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

          const { data } = await authApi.getMe();
          networkErrorCount = 0; // Reset on success
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
            networkErrorCount = 0;
            localStorage.removeItem('accessToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else if (!error.response) {
            // Network error - increment counter and clear state after 3 consecutive errors
            networkErrorCount++;
            if (networkErrorCount >= 3) {
              // Too many network errors - clear stale state
              set({ user: null, isAuthenticated: false, isLoading: false });
              networkErrorCount = 0;
            } else {
              // Keep persisted state but stop loading
              set({ isLoading: false });
            }
          } else {
            // Other error - keep the persisted state
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

// Cross-tab synchronization - listen for auth changes in other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Handle accessToken removal (logout in another tab)
    if (event.key === 'accessToken' && !event.newValue) {
      // Token removed in another tab - logout this tab too
      useAuthStore.setState({ user: null, isAuthenticated: false });
    }

    // Handle Zustand state changes (login/logout in another tab)
    if (event.key === 'auth-storage' && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue);
        if (newState.state) {
          useAuthStore.setState({
            user: newState.state.user || null,
            isAuthenticated: newState.state.isAuthenticated || false,
          });
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  });
}
