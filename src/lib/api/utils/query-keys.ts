/**
 * Query Key Utilities
 * Helpers for creating consistent React Query cache keys
 */

import type { QueryParams } from '@/types';

/**
 * Serialize params to a stable string for cache keys
 */
export const serializeParams = (params?: Record<string, any>): string => {
  if (!params) return '';

  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (result, key) => {
        const value = params[key];
        // Skip undefined/null values
        if (value !== undefined && value !== null) {
          result[key] = value;
        }
        return result;
      },
      {} as Record<string, any>
    );

  return JSON.stringify(sortedParams);
};

/**
 * Create a query key with optional params
 */
export const createQueryKey = (
  base: readonly string[],
  params?: QueryParams | Record<string, any>
): readonly unknown[] => {
  if (!params || Object.keys(params).length === 0) {
    return base;
  }
  return [...base, serializeParams(params)];
};

/**
 * Create a paginated query key
 */
export const createPaginatedKey = (
  base: readonly string[],
  page?: number,
  limit?: number,
  filters?: Record<string, any>
): readonly unknown[] => {
  const params: Record<string, any> = {};
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.limit = limit;
  if (filters) params.filters = filters;
  return createQueryKey(base, params);
};

/**
 * Query key factory helper
 */
export const createQueryKeyFactory = <T extends string>(domain: T) => ({
  all: [domain] as const,
  lists: () => [...createQueryKeyFactory(domain).all, 'list'] as const,
  list: (params?: QueryParams) =>
    createQueryKey(createQueryKeyFactory(domain).lists(), params),
  details: () => [...createQueryKeyFactory(domain).all, 'detail'] as const,
  detail: (id: string) =>
    [...createQueryKeyFactory(domain).details(), id] as const,
});
