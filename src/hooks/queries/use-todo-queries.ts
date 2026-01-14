/**
 * Todo Query Hooks
 * React Query hooks for fetching todo-related data
 */

import type { TodoStats } from '@/lib/api/services';
import { todoKeys, todoService } from '@/lib/api/services';
import type { PaginatedResponse, QueryParams, Todo } from '@/types';
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

/**
 * Hook to fetch paginated todos
 */
export const useTodos = (
  params?: QueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Todo>, Error>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedResponse<Todo>, Error>({
    queryKey: todoKeys.list(params),
    queryFn: () => todoService.getAll(params),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
};

/**
 * Hook to fetch infinite/load-more todos
 */
export const useInfiniteTodos = (params?: Omit<QueryParams, 'page'>) => {
  return useInfiniteQuery<
    PaginatedResponse<Todo>,
    Error,
    InfiniteData<PaginatedResponse<Todo>>,
    readonly unknown[],
    number
  >({
    queryKey: [...todoKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam }) =>
      todoService.getAll({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
};

/**
 * Hook to fetch a single todo by ID
 */
export const useTodo = (
  id: string,
  options?: Omit<UseQueryOptions<Todo, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Todo, Error>({
    queryKey: todoKeys.detail(id),
    queryFn: () => todoService.getById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to fetch todo statistics
 */
export const useTodoStats = (
  options?: Omit<UseQueryOptions<TodoStats, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TodoStats, Error>({
    queryKey: todoKeys.stats(),
    queryFn: () => todoService.getStats(),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Hook to fetch todos by priority
 */
export const useTodosByPriority = (
  priority: 'low' | 'medium' | 'high',
  params?: Omit<QueryParams, 'filters'>,
  options?: Omit<UseQueryOptions<Todo[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Todo[], Error>({
    queryKey: todoKeys.byPriority(priority),
    queryFn: () => todoService.getByPriority(priority, params),
    ...options,
  });
};

/**
 * Hook to fetch todos by completion status
 */
export const useTodosByStatus = (
  completed: boolean,
  params?: Omit<QueryParams, 'filters'>,
  options?: Omit<UseQueryOptions<Todo[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Todo[], Error>({
    queryKey: todoKeys.byStatus(completed),
    queryFn: () => todoService.getByStatus(completed, params),
    ...options,
  });
};

/**
 * Hook to fetch overdue todos
 */
export const useOverdueTodos = (
  options?: Omit<UseQueryOptions<Todo[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Todo[], Error>({
    queryKey: ['todos', 'overdue'],
    queryFn: () => todoService.getOverdue(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch todos due today
 */
export const useTodosDueToday = (
  options?: Omit<UseQueryOptions<Todo[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Todo[], Error>({
    queryKey: ['todos', 'due-today'],
    queryFn: () => todoService.getDueToday(),
    ...options,
  });
};

/**
 * Hook to search todos
 */
export const useSearchTodos = (
  query: string,
  params?: QueryParams,
  options?: Omit<UseQueryOptions<Todo[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Todo[], Error>({
    queryKey: ['todos', 'search', query, params],
    queryFn: () => todoService.search(query, params),
    enabled: query.length >= 2,
    ...options,
  });
};
