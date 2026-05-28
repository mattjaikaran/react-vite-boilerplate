import { apiClient, buildQueryString, createQueryKey, handleApiResponse } from '@/lib/api';
import type {
  CreateTodoRequest,
  DjangoPaginatedResponse,
  PaginatedResponse,
  QueryParams,
  Todo,
  UpdateTodoRequest,
} from '@/types';
import { normalizePaginatedResponse } from '@/types/api';

export const todosApi = {
  // Get all todos with optional filtering and pagination
  getTodos: async (params?: QueryParams): Promise<PaginatedResponse<Todo>> => {
    const queryString = params ? buildQueryString(params) : '';
    const url = queryString ? `/todos?${queryString}` : '/todos';
    const response = await apiClient.get<
      PaginatedResponse<Todo> | DjangoPaginatedResponse<Todo>
    >(url);
    const data = handleApiResponse(response);
    // Normalize Django paginated format if needed
    if ('items' in data) {
      return normalizePaginatedResponse(data as DjangoPaginatedResponse<Todo>);
    }
    return data as PaginatedResponse<Todo>;
  },

  // Get a single todo by ID
  getTodo: async (id: string): Promise<Todo> => {
    const response = await apiClient.get<Todo>(`/todos/${id}`);
    return handleApiResponse(response);
  },

  // Create a new todo
  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await apiClient.post<Todo>('/todos', todo);
    return handleApiResponse(response);
  },

  // Update an existing todo
  updateTodo: async (id: string, updates: UpdateTodoRequest): Promise<Todo> => {
    const response = await apiClient.patch<Todo>(`/todos/${id}`, updates);
    return handleApiResponse(response);
  },

  // Delete a todo
  deleteTodo: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/todos/${id}`
    );
    return handleApiResponse(response);
  },

  // Toggle todo completion status
  toggleTodo: async (id: string): Promise<Todo> => {
    const response = await apiClient.patch<Todo>(`/todos/${id}/toggle`);
    return handleApiResponse(response);
  },

  // Bulk operations
  bulkUpdate: async (
    ids: string[],
    updates: UpdateTodoRequest
  ): Promise<Todo[]> => {
    const response = await apiClient.patch<Todo[]>('/todos/bulk', {
      ids,
      updates,
    });
    return handleApiResponse(response);
  },

  bulkDelete: async (
    ids: string[]
  ): Promise<{ message: string; deletedCount: number }> => {
    const response = await apiClient.delete<{
      message: string;
      deletedCount: number;
    }>('/todos/bulk', {
      data: { ids },
    });
    return handleApiResponse(response);
  },

  // Get todo statistics
  getStats: async (): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    byPriority: Record<string, number>;
  }> => {
    const response = await apiClient.get<{
      total: number;
      completed: number;
      pending: number;
      overdue: number;
      byPriority: Record<string, number>;
    }>('/todos/stats');
    return handleApiResponse(response);
  },
};

// Query keys for React Query
export const todoQueryKeys = {
  all: ['todos'] as const,
  lists: () => [...todoQueryKeys.all, 'list'] as const,
  list: (params?: QueryParams) =>
    [...todoQueryKeys.lists(), createQueryKey('params', params)] as const,
  details: () => [...todoQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoQueryKeys.details(), id] as const,
  stats: () => [...todoQueryKeys.all, 'stats'] as const,
};
