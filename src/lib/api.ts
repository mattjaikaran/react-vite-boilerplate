import { config, isDjangoSPA } from '@/config';
import { getCSRFToken } from '@/lib/django-integration';
import type { ApiError, ApiResponse } from '@/types';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token and Django CSRF
  instance.interceptors.request.use(
    requestConfig => {
      // Add auth token
      const token = localStorage.getItem(config.auth.tokenKey);
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Add Django CSRF token if in Django SPA mode
      if (isDjangoSPA()) {
        const csrfToken = getCSRFToken();
        if (csrfToken) {
          requestConfig.headers['X-CSRFToken'] = csrfToken;
        }
      }

      return requestConfig;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle common responses
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      return response;
    },
    async error => {
      const originalRequest = error.config;

      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem(
            config.auth.refreshTokenKey
          );
          if (refreshToken) {
            const response = await instance.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken } = response.data.data;
            localStorage.setItem(config.auth.tokenKey, accessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          localStorage.removeItem('user');

          // Redirect based on mode
          if (isDjangoSPA()) {
            window.location.href = '/admin/login/';
          } else {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      }

      // Transform error response
      const apiError: ApiError = {
        message:
          error.response?.data?.message || error.message || 'An error occurred',
        code: error.response?.data?.code || error.code,
        details: error.response?.data?.details,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Create the main API instance
export const api = createApiInstance();

// Generic API methods
export const apiClient = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.get(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.post(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.put(url, data, config),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.patch(url, data, config),

  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.delete(url, config),
};

// Utility function to handle API responses
export const handleApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T>>
): T => {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'API request failed');
};

// Utility function to create query keys for React Query
export const createQueryKey = (
  key: string,
  params?: Record<string, any>
): string[] => {
  if (!params) return [key];

  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = params[key];
        return result;
      },
      {} as Record<string, any>
    );

  return [key, JSON.stringify(sortedParams)];
};
