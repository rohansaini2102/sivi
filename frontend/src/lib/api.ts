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

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints to prevent infinite loops
      if (originalRequest.url?.includes('/auth/refresh') ||
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/admin/verify')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;

        // Save new token
        localStorage.setItem('accessToken', newToken);

        isRefreshing = false;
        onTokenRefreshed(newToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Refresh failed - clear token and redirect to appropriate login
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          // Only redirect if not already on a login page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login')) {
            const isAdminRoute = currentPath.startsWith('/admin');
            window.location.href = isAdminRoute ? '/admin/login' : '/login';
          }
        }
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

  refreshToken: () =>
    api.post('/auth/refresh'),

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
