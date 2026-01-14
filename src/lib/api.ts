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
 * Django Ninja error response types
 */
interface DjangoErrorResponse {
  detail?: string | { msg: string; loc: string[] }[];
  message?: string;
  code?: string;
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
    // Include credentials for CSRF cookies
    withCredentials: isDjangoSPA(),
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
    async (error: AxiosError<DjangoErrorResponse>) => {
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
            // Django Ninja JWT uses /token/refresh with 'refresh' field
            const refreshPath = isDjangoSPA()
              ? '/token/refresh'
              : '/auth/refresh';
            const refreshPayload = isDjangoSPA()
              ? { refresh: refreshToken }
              : { refreshToken };

            const response = await instance.post<
              ApiResponse<{ accessToken: string }> | { access: string }
            >(refreshPath, refreshPayload);

            // Handle both response formats
            let newToken: string;
            if ('access' in response.data) {
              newToken = response.data.access;
            } else if (
              'data' in response.data &&
              response.data.data?.accessToken
            ) {
              newToken = response.data.data.accessToken;
            } else {
              throw new Error('Invalid refresh response');
            }

            localStorage.setItem(config.auth.tokenKey, newToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens
          localStorage.removeItem(config.auth.tokenKey);
          localStorage.removeItem(config.auth.refreshTokenKey);
          localStorage.removeItem('user');

          // Redirect based on mode
          if (isDjangoSPA()) {
            window.location.href = '/auth/login';
          } else {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      }

      // Extract error message from various formats
      let errorMessage = 'An error occurred';
      const responseData = error.response?.data;

      if (responseData) {
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail.map(d => d.msg).join(', ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Transform error response
      const apiError: ApiError = {
        message: errorMessage,
        code: responseData?.code || error.code,
        details: undefined,
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
