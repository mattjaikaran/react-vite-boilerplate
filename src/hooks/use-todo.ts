import { todoQueryKeys, todosApi } from '@/api/todos';
import { useUI } from '@/lib/store';
import type {
  CreateTodoRequest,
  QueryParams,
  Todo,
  UpdateTodoRequest,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

// Todo hooks
export const useTodos = (params?: QueryParams, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: todoQueryKeys.list(params),
    queryFn: () => todosApi.getTodos(params),
    ...options,
  });
};

export const useTodo = (id: string, options?: UseQueryOptions<Todo, Error>) => {
  return useQuery({
    queryKey: todoQueryKeys.detail(id),
    queryFn: () => todosApi.getTodo(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateTodo = (
  options?: UseMutationOptions<Todo, Error, CreateTodoRequest>
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation({
    mutationFn: todosApi.createTodo,
    onSuccess: data => {
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.stats() });

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

export const useUpdateTodo = (
  options?: UseMutationOptions<
    Todo,
    Error,
    { id: string; updates: UpdateTodoRequest }
  >
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation({
    mutationFn: ({ id, updates }) => todosApi.updateTodo(id, updates),
    onSuccess: data => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoQueryKeys.detail(data.id), data);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.stats() });

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

export const useDeleteTodo = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation({
    mutationFn: todosApi.deleteTodo,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: todoQueryKeys.detail(id) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.stats() });

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

export const useToggleTodo = (
  options?: UseMutationOptions<Todo, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: todosApi.toggleTodo,
    onSuccess: data => {
      // Update the specific todo in cache
      queryClient.setQueryData(todoQueryKeys.detail(data.id), data);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.stats() });
    },
    ...options,
  });
};

export const useTodoStats = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: todoQueryKeys.stats(),
    queryFn: todosApi.getStats,
    ...options,
  });
};
