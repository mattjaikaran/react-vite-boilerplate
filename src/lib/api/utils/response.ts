/**
 * API Response Utilities
 * Helpers for handling and transforming API responses
 * Compatible with both wrapped responses and Django Ninja direct responses
 */

import type {
  ApiResponse,
  DjangoPaginatedResponse,
  PaginatedResponse,
} from '@/types';
import type { AxiosResponse } from 'axios';

/**
 * Check if response is in wrapped format ({ success, data, message })
 */
const isWrappedResponse = <T>(data: unknown): data is ApiResponse<T> => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'data' in data
  );
};

/**
 * Check if response is Django Ninja paginated format
 */
const isDjangoPaginated = <T>(
  data: unknown
): data is DjangoPaginatedResponse<T> => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    'count' in data &&
    'page' in data
  );
};

/**
 * Extract data from a successful API response
 * Handles both wrapped format and Django Ninja direct format
 */
export const handleApiResponse = <T>(
  response: AxiosResponse<ApiResponse<T> | T>
): T => {
  const data = response.data;

  // Handle wrapped response format
  if (isWrappedResponse<T>(data)) {
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'API request failed');
  }

  // Handle Django Ninja direct response format
  // If the response has a 'detail' field, it's likely an error
  if (typeof data === 'object' && data !== null && 'detail' in data) {
    const detail = (data as { detail: string | { msg: string }[] }).detail;
    if (typeof detail === 'string') {
      throw new Error(detail);
    }
    if (Array.isArray(detail)) {
      throw new Error(detail.map(d => d.msg).join(', '));
    }
  }

  // Direct response - return as is
  return data as T;
};

/**
 * Extract paginated data from API response
 * Handles both wrapped format and Django Ninja pagination format
 */
export const handlePaginatedResponse = <T>(
  response: AxiosResponse<
    | ApiResponse<PaginatedResponse<T>>
    | DjangoPaginatedResponse<T>
    | PaginatedResponse<T>
  >
): PaginatedResponse<T> => {
  const data = response.data;

  // Handle wrapped response format
  if (isWrappedResponse<PaginatedResponse<T>>(data)) {
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'API request failed');
  }

  // Handle Django Ninja paginated format
  if (isDjangoPaginated<T>(data)) {
    return {
      data: data.items,
      pagination: {
        page: data.page,
        limit: data.page_size,
        total: data.count,
        totalPages: data.pages,
      },
    };
  }

  // Already in correct format
  if ('data' in data && 'pagination' in data) {
    return data as PaginatedResponse<T>;
  }

  throw new Error('Unexpected response format');
};

/**
 * Create a standardized success response
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

/**
 * Create a standardized error response
 */
export const createErrorResponse = <T = null>(
  message: string,
  data?: T
): ApiResponse<T> => ({
  success: false,
  data: data as T,
  message,
});
