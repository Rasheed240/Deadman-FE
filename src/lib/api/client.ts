/**
 * API Client for Dead Man's Bomb
 * Axios-based HTTP client with authentication and error handling
 */
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management
const TOKEN_KEY = 'dmb_access_token';
const REFRESH_TOKEN_KEY = 'dmb_refresh_token';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Parses axios error into a human-readable string
 */
const parseError = (error: AxiosError): string => {
  const data = error.response?.data as any;

  if (data?.errors && Array.isArray(data.errors)) {
    return data.errors[0]?.message || 'Validation error';
  }

  if (typeof data === 'string') return data;

  return (
    data?.error ||
    data?.message ||
    data?.detail ||
    (error.response?.status === 404 ? 'Resource not found' : 'An unexpected error occurred')
  );
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle session expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        setTokens(access, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        processQueue(null, access);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle global notifications for other errors
    const status = error.response?.status;
    const isAuthRequest = originalRequest.url?.includes('/auth/');

    if (status && status !== 401) {
      // Don't toast for validation errors on auth pages (handled in-form)
      if (!(status === 400 && isAuthRequest)) {
        toast.error(parseError(error));
      }
    } else if (!status && error.request) {
      toast.error('Network connectivity issue. Please check your internet.');
    }

    return Promise.reject(error);
  }
);

// Generic request methods
export const api = {
  get: <T = any>(url: string, config = {}) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config = {}) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config = {}) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T = any>(url: string, data?: any, config = {}) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config = {}) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};
