/**
 * Todo Service
 * Handles all todo-related API calls
 */

import type {
  CreateTodoRequest,
  QueryParams,
  Todo,
  UpdateTodoRequest,
} from '@/types';
import { createQueryKeyFactory } from '../utils/query-keys';
import { BaseService } from './base.service';

/**
 * Todo query keys for React Query cache management
 */
export const todoKeys = {
  ...createQueryKeyFactory('todos'),
  stats: () => ['todos', 'stats'] as const,
  byPriority: (priority: string) => ['todos', 'priority', priority] as const,
  byStatus: (completed: boolean) => ['todos', 'status', completed] as const,
};

/**
 * Todo statistics response type
 */
export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: Record<string, number>;
}

/**
 * Bulk operation response type
 */
export interface BulkDeleteResponse {
  message: string;
  deletedCount: number;
}

/**
 * Todo Service Class
 */
class TodoServiceClass extends BaseService<
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest
> {
  constructor() {
    super({ basePath: '/todos' });
  }

  /**
   * Toggle todo completion status
   */
  async toggle(id: string): Promise<Todo> {
    return this.patch<Todo>(`/${id}/toggle`);
  }

  /**
   * Bulk update multiple todos
   */
  async bulkUpdate(ids: string[], updates: UpdateTodoRequest): Promise<Todo[]> {
    return this.patch<Todo[]>('/bulk', { ids, updates });
  }

  /**
   * Bulk delete multiple todos
   */
  async bulkDelete(ids: string[]): Promise<BulkDeleteResponse> {
    return this.post<BulkDeleteResponse>('/bulk-delete', { ids });
  }

  /**
   * Get todo statistics
   */
  async getStats(): Promise<TodoStats> {
    return this.get<TodoStats>('/stats');
  }

  /**
   * Get todos by priority
   */
  async getByPriority(
    priority: 'low' | 'medium' | 'high',
    params?: Omit<QueryParams, 'filters'>
  ): Promise<Todo[]> {
    const response = await this.getAll({
      ...params,
      filters: { priority },
    });
    return response.data;
  }

  /**
   * Get todos by completion status
   */
  async getByStatus(
    completed: boolean,
    params?: Omit<QueryParams, 'filters'>
  ): Promise<Todo[]> {
    const response = await this.getAll({
      ...params,
      filters: { completed },
    });
    return response.data;
  }

  /**
   * Search todos by title/description
   */
  async search(query: string, params?: QueryParams): Promise<Todo[]> {
    const response = await this.getAll({
      ...params,
      search: query,
    });
    return response.data;
  }

  /**
   * Get overdue todos
   */
  async getOverdue(): Promise<Todo[]> {
    return this.get<Todo[]>('/overdue');
  }

  /**
   * Get todos due today
   */
  async getDueToday(): Promise<Todo[]> {
    return this.get<Todo[]>('/due-today');
  }

  /**
   * Archive completed todos
   */
  async archiveCompleted(): Promise<{
    message: string;
    archivedCount: number;
  }> {
    return this.post<{ message: string; archivedCount: number }>(
      '/archive-completed'
    );
  }
}

// Export singleton instance
export const todoService = new TodoServiceClass();
