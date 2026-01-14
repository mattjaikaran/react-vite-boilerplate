/**
 * Todo Mutation Hooks
 * React Query hooks for todo mutations (create, update, delete, etc.)
 */

import type { BulkDeleteResponse } from '@/lib/api/services';
import { todoKeys, todoService } from '@/lib/api/services';
import { useUI } from '@/lib/store';
import type { CreateTodoRequest, Todo, UpdateTodoRequest } from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

/**
 * Hook for creating a new todo
 */
export const useCreateTodo = (
  options?: Omit<
    UseMutationOptions<Todo, Error, CreateTodoRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<Todo, Error, CreateTodoRequest>({
    mutationFn: todoService.create.bind(todoService),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      addNotification({
        type: 'success',
        title: 'Todo created',
        message: `"${data.title}" has been created successfully.`,
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Failed to create todo',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for updating a todo
 */
export const useUpdateTodo = (
  options?: Omit<
    UseMutationOptions<Todo, Error, { id: string; updates: UpdateTodoRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<Todo, Error, { id: string; updates: UpdateTodoRequest }>({
    mutationFn: ({ id, updates }) => todoService.update(id, updates),
    onSuccess: data => {
      // Update cache directly
      queryClient.setQueryData(todoKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      addNotification({
        type: 'success',
        title: 'Todo updated',
        message: `"${data.title}" has been updated successfully.`,
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Failed to update todo',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for deleting a todo
 */
export const useDeleteTodo = (
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: id => todoService.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      addNotification({
        type: 'success',
        title: 'Todo deleted',
        message: 'Todo has been deleted successfully.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Failed to delete todo',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for toggling todo completion status
 */
export const useToggleTodo = (
  options?: Omit<UseMutationOptions<Todo, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, string>({
    mutationFn: todoService.toggle.bind(todoService),
    onMutate: async id => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(id) });
      const previousTodo = queryClient.getQueryData<Todo>(todoKeys.detail(id));

      if (previousTodo) {
        queryClient.setQueryData<Todo>(todoKeys.detail(id), {
          ...previousTodo,
          completed: !previousTodo.completed,
        });
      }

      return { previousTodo };
    },
    onError: (_, id, context: any) => {
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(id), context.previousTodo);
      }
    },
    onSuccess: data => {
      queryClient.setQueryData(todoKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
    },
    ...options,
  });
};

/**
 * Hook for bulk updating todos
 */
export const useBulkUpdateTodos = (
  options?: Omit<
    UseMutationOptions<
      Todo[],
      Error,
      { ids: string[]; updates: UpdateTodoRequest }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<
    Todo[],
    Error,
    { ids: string[]; updates: UpdateTodoRequest }
  >({
    mutationFn: ({ ids, updates }) => todoService.bulkUpdate(ids, updates),
    onSuccess: (data, { ids }) => {
      // Update each todo in cache
      data.forEach(todo => {
        queryClient.setQueryData(todoKeys.detail(todo.id), todo);
      });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      addNotification({
        type: 'success',
        title: 'Todos updated',
        message: `${ids.length} todos have been updated.`,
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Bulk update failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for bulk deleting todos
 */
export const useBulkDeleteTodos = (
  options?: Omit<
    UseMutationOptions<BulkDeleteResponse, Error, string[]>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<BulkDeleteResponse, Error, string[]>({
    mutationFn: todoService.bulkDelete.bind(todoService),
    onSuccess: (data, ids) => {
      // Remove each todo from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.stats() });
      addNotification({
        type: 'success',
        title: 'Todos deleted',
        message: `${data.deletedCount} todos have been deleted.`,
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Bulk delete failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for archiving completed todos
 */
export const useArchiveCompletedTodos = (
  options?: Omit<
    UseMutationOptions<{ message: string; archivedCount: number }, Error, void>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<{ message: string; archivedCount: number }, Error, void>({
    mutationFn: todoService.archiveCompleted.bind(todoService),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      addNotification({
        type: 'success',
        title: 'Todos archived',
        message: `${data.archivedCount} completed todos have been archived.`,
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Archive failed',
        message: error.message,
      });
    },
    ...options,
  });
};
