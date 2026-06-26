import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { getToken, clearAuth } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const getErrorMessage = (data: unknown) => {
  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) {
      return message[0] ?? 'Request failed';
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Request failed';
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data, config } = error.response;
      const url = config?.url || '';

      // Skip redirect for login/register endpoints (handle auth errors gracefully)
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

      if (status === 401) {
        if (!isAuthEndpoint) {
          // Only redirect for session expiry on protected routes
          clearAuth();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          toast.error('Session expired. Please login again.');
        } else {
          // For login/register, just show error without redirect
          toast.error(getErrorMessage(data));
        }
        return Promise.reject(error);
      }

      if (status === 400) {
        toast.error(getErrorMessage(data));
      }

      if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }

      if (status !== 400 && status < 500) {
        toast.error(getErrorMessage(data));
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;