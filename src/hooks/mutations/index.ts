/**
 * Mutation Hooks Exports
 * Domain-specific hooks for mutations
 */

// Auth mutations
export {
  useChangePassword,
  useLogin,
  useLogout,
  useMagicLink,
  useRegister,
  useRequestPasswordReset,
  useResetPassword,
  useUpdateProfile,
  useVerifyMagicLink,
} from './use-auth-mutations';

// Todo mutations
export {
  useArchiveCompletedTodos,
  useBulkDeleteTodos,
  useBulkUpdateTodos,
  useCreateTodo,
  useDeleteTodo,
  useToggleTodo,
  useUpdateTodo,
} from './use-todo-mutations';
