import { config, isDjangoSPA } from '@/config';
import { getCSRFToken } from '@/lib/django-integration';
import type { ApiError, ApiResponse, QueryParams } from '@/types';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

/**
 * Extended request config with retry flag
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Create axios instance with default config
 */
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
    (requestConfig: InternalAxiosRequestConfig) => {
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
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle common responses
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (
      error: AxiosError<{
        message?: string;
        code?: string;
        details?: Record<string, string | string[]>;
      }>
    ) => {
      const originalRequest = error.config as
        | ExtendedAxiosRequestConfig
        | undefined;

      // Handle 401 errors (unauthorized)
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem(
            config.auth.refreshTokenKey
          );
          if (refreshToken) {
            const response = await instance.post<
              ApiResponse<{ accessToken: string }>
            >('/auth/refresh', {
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

/**
 * Generic API methods with proper typing
 */
export const apiClient = {
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.get(url, config),

  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.post(url, data, config),

  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.put(url, data, config),

  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.patch(url, data, config),

  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => api.delete(url, config),
};

/**
 * Utility function to handle API responses
 */
export const handleApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T>>
): T => {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'API request failed');
};

/**
 * Utility function to create query keys for React Query
 */
export const createQueryKey = (
  key: string,
  params?: QueryParams | Record<string, string | number | boolean | undefined>
): (
  | string
  | QueryParams
  | Record<string, string | number | boolean | undefined>
)[] => {
  if (!params) return [key];
  return [key, params];
};

/**
 * Build query string from params object
 */
export const buildQueryString = (params: QueryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.page_size) searchParams.set('page_size', String(params.page_size));
  if (params.search) searchParams.set('search', params.search);
  if (params.ordering) searchParams.set('ordering', params.ordering);

  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }

  return searchParams.toString();
};
