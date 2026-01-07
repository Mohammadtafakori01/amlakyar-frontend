import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// In development, use Next.js proxy to avoid CORS issues
// In production, use the full API URL
const API_BASE_URL = 
  process.env.NODE_ENV === 'development'
    ? '/api' // Use Next.js proxy in development
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Don't override Content-Type if it's already set (for multipart/form-data)
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']; // Let browser set it with boundary
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use the same base URL logic for refresh token
          const refreshUrl = process.env.NODE_ENV === 'development'
            ? '/api/auth/refresh'
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/refresh`;
          const response = await axios.post(refreshUrl, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Update tokens
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

