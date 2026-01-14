/**
 * API Response Utilities
 * Helpers for handling and transforming API responses
 */

import type { ApiResponse, PaginatedResponse } from '@/types';
import type { AxiosResponse } from 'axios';

/**
 * Extract data from a successful API response
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
 * Extract paginated data from API response
 */
export const handlePaginatedResponse = <T>(
  response: AxiosResponse<ApiResponse<PaginatedResponse<T>>>
): PaginatedResponse<T> => {
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'API request failed');
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
