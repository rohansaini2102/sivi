import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints that should skip token refresh (use exact matching)
const AUTH_ENDPOINTS_SKIP_REFRESH = new Set([
  '/auth/refresh',
  '/auth/login',
  '/auth/logout',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/admin/verify-password',
  '/auth/admin/verify-otp',
  '/auth/me',
]);

// Promise-based mutex for token refresh to prevent race conditions
let refreshPromise: Promise<string> | null = null;

// Subscriber queue with both resolve and reject handlers
let refreshSubscribers: { resolve: (token: string) => void; reject: (error: Error) => void }[] = [];

const subscribeTokenRefresh = (resolve: (token: string) => void, reject: (error: Error) => void) => {
  refreshSubscribers.push({ resolve, reject });
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

const onTokenRefreshFailed = (error: Error) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

// Refresh tokens function
const refreshTokens = async (): Promise<string> => {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  const { data } = await api.post('/auth/refresh', {
    refreshToken: storedRefreshToken,
  });
  const newToken = data.data.accessToken;

  // Save new tokens
  localStorage.setItem('accessToken', newToken);
  if (data.data.refreshToken) {
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }

  return newToken;
};

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Extract endpoint path for exact matching
      // CRITICAL: In production, axios resolves URLs to full URLs (https://domain.com/api/auth/me)
      // The old regex replace(/^\/api/, '') only works for relative URLs starting with /api
      // Use URL parsing to properly extract pathname regardless of URL format
      let endpoint = '';
      try {
        const url = new URL(originalRequest.url || '', window.location.origin);
        endpoint = url.pathname.replace(/^\/api/, '').split('?')[0];
      } catch {
        // Fallback for relative URLs or if URL parsing fails
        endpoint = originalRequest.url?.replace(/^\/api/, '').split('?')[0] || '';
      }

      // Skip refresh for auth endpoints to prevent infinite loops
      if (AUTH_ENDPOINTS_SKIP_REFRESH.has(endpoint)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If a refresh is already in progress, wait for it
      if (refreshPromise) {
        try {
          const newToken = await refreshPromise;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      // Start a new refresh - use Promise-based mutex to prevent race conditions
      refreshPromise = refreshTokens()
        .then((newToken) => {
          onTokenRefreshed(newToken);
          return newToken;
        })
        .catch((refreshError) => {
          onTokenRefreshFailed(refreshError as Error);

          // Refresh failed - clear tokens and redirect to appropriate login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (typeof window !== 'undefined') {
            // Only redirect if not already on a login page
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login')) {
              const isAdminRoute = currentPath.startsWith('/admin');
              window.location.href = isAdminRoute ? '/admin/login' : '/login';
            }
          }
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });

      try {
        const newToken = await refreshPromise;
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  sendOTP: (type: 'email' | 'phone', value: string) =>
    api.post('/auth/send-otp', { type, value }),

  verifyOTP: (type: 'email' | 'phone', value: string, otp: string, name?: string) =>
    api.post('/auth/verify-otp', { type, value, otp, name }),

  // Admin 2FA login - Step 1: Verify password and send OTP
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin/verify-password', { email, password }),

  adminVerifyPassword: (email: string, password: string) =>
    api.post('/auth/admin/verify-password', { email, password }),

  // Admin 2FA login - Step 2: Verify OTP and complete login
  adminVerifyOTP: (email: string, otp: string, tempToken: string) =>
    api.post('/auth/admin/verify-otp', { email, otp, tempToken }),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post('/auth/admin/change-password', { oldPassword, newPassword }),

  refreshToken: () => {
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    return api.post('/auth/refresh', { refreshToken: storedRefreshToken });
  },

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get('/auth/me'),
};

// User API
export const userApi = {
  getProfile: () =>
    api.get('/user/profile'),

  updateProfile: (data: {
    name?: string;
    language?: 'hi' | 'en';
    avatar?: string;
    preferences?: {
      examCategory?: string;
      notifications?: boolean;
      darkMode?: boolean;
    };
  }) => api.put('/user/profile', data),

  updateStudentInfo: (data: {
    fatherName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    qualification?: string;
    preparingFor?: string[];
  }) => api.put('/user/student-info', data),

  getDashboard: () =>
    api.get('/user/dashboard'),
};

// Store API (public)
export const storeApi = {
  getCourses: (params?: { category?: string; page?: number; limit?: number }) =>
    api.get('/store/courses', { params }),

  getCourse: (slug: string) =>
    api.get(`/store/courses/${slug}`),

  getTestSeries: (params?: { category?: string; page?: number; limit?: number }) =>
    api.get('/store/test-series', { params }),

  getTestSeriesDetail: (slug: string) =>
    api.get(`/store/test-series/${slug}`),

  search: (query: string) =>
    api.get('/store/search', { params: { q: query } }),
};

// Payment API
export const paymentApi = {
  // Get payment history with pagination
  getPaymentHistory: (page: number = 1, limit: number = 20) =>
    api.get('/payment/history', { params: { page, limit } }),

  // Create payment order
  createOrder: (itemType: 'course' | 'test_series', itemId: string, couponCode?: string) =>
    api.post('/payment/create-order', { itemType, itemId, couponCode }),

  // Verify payment
  verifyPayment: (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post('/payment/verify', data),
};

// Learn API (Enrollment & Progress)
export const learnApi = {
  // Get user's enrollments
  getEnrollments: (itemType?: 'course' | 'test_series') => {
    const params = itemType ? { itemType } : {};
    return api.get('/learn/enrollments', { params });
  },

  // Check if user is enrolled in specific item
  checkEnrollment: (itemType: 'course' | 'test_series', itemId: string) =>
    api.get('/learn/check-enrollment', {
      params: { itemType, itemId },
    }),

  // Get course content (for enrolled users)
  getCourseContent: (courseId: string) =>
    api.get(`/learn/courses/${courseId}`),

  // Get course progress
  getCourseProgress: (courseId: string) =>
    api.get(`/learn/courses/${courseId}/progress`),

  // Get lesson content
  getLessonContent: (lessonId: string) =>
    api.get(`/learn/lessons/${lessonId}`),

  // Mark lesson as completed
  markLessonComplete: (lessonId: string) =>
    api.post(`/learn/lessons/${lessonId}/complete`),

  // Get test series content (for enrolled users)
  getTestSeriesContent: (testSeriesId: string) =>
    api.get(`/learn/test-series/${testSeriesId}`),

  // Quiz APIs
  startQuiz: (quizId: string) =>
    api.post(`/learn/quizzes/${quizId}/start`),

  getQuizAttempts: (quizId: string) =>
    api.get(`/learn/quizzes/${quizId}/attempts`),

  // Quiz attempt APIs
  submitAnswer: (attemptId: string, questionId: string, selectedOption: string) =>
    api.post(`/learn/quiz-attempts/${attemptId}/answer`, { questionId, selectedOption }),

  submitQuiz: (attemptId: string, answers: Record<string, string>) =>
    api.post(`/learn/quiz-attempts/${attemptId}/submit`, { answers }),

  getQuizResult: (attemptId: string) =>
    api.get(`/learn/quiz-attempts/${attemptId}/result`),

  // Dashboard
  getDashboardProgress: () =>
    api.get('/learn/dashboard/progress'),

  // Submit exam attempt (legacy)
  submitExamAttempt: (examId: string, answers: Record<string, string>) =>
    api.post(`/learn/exams/${examId}/submit`, { answers }),

  // Get exam results (legacy)
  getExamResults: (attemptId: string) =>
    api.get(`/learn/exam-attempts/${attemptId}`),
};

export default api;
