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

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;

        // Save new token
        localStorage.setItem('accessToken', newToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear token and redirect to login
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
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

export default api;
