/**
 * Hooks Exports
 * Central export point for all React hooks
 */

// ============================================
// API Hooks - Generic API operations
// ============================================
export {
  useApiDelete,
  useApiDeleteById,
  // Query hooks
  useApiGet,
  useApiInfinite,
  useApiPatch,
  // Mutation hooks
  useApiPost,
  useApiPut,
  useApiQuery,
  useInvalidate,
  // Optimistic updates
  useOptimisticAdd,
  useOptimisticMutation,
  useOptimisticRemove,
  useOptimisticUpdate,
  usePrefetch,
} from './api';

// ============================================
// Query Hooks - Domain-specific data fetching
// ============================================
export {
  useAuthStatus,
  useInfiniteTodos,
  useOverdueTodos,
  // Auth queries
  useProfile,
  useSearchTodos,
  useSessionCheck,
  useTodo,
  // Todo queries
  useTodos,
  useTodosByPriority,
  useTodosByStatus,
  useTodosDueToday,
  useTodoStats,
} from './queries';

// ============================================
// Mutation Hooks - Domain-specific mutations
// ============================================
export {
  useArchiveCompletedTodos,
  useBulkDeleteTodos,
  useBulkUpdateTodos,
  useChangePassword,
  // Todo mutations
  useCreateTodo,
  useDeleteTodo,
  // Auth mutations
  useLogin,
  useLogout,
  useMagicLink,
  useRegister,
  useRequestPasswordReset,
  useResetPassword,
  useToggleTodo,
  useUpdateProfile,
  useUpdateTodo,
  useVerifyMagicLink,
} from './mutations';

// ============================================
// Utility Hooks - Common utilities
// ============================================
export {
  useBreakpoint,
  // Debounce
  useDebounce,
  useDebouncedCallback,
  useDebounceWithLoading,
  useIsDesktop,
  useIsLargeDesktop,
  useIsMobile,
  useIsTablet,
  // Storage
  useLocalStorage,
  // Media queries
  useMediaQuery,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  useSessionStorage,
} from './utils';

// ============================================
// Store Hooks - Config and Theme (Zustand)
// ============================================
export {
  useApiConfig,
  useAppConfig,
  useAuth,
  useAuthConfig,
  useDjangoConfig,
  useEnvConfig,
  useFeatureEnabled,
  useIsDjangoSPA,
  useIsStandalone,
  useSetTheme,
  useTheme,
  useTodos as useTodosStore,
  useToggleTheme,
  useUI,
} from '@/lib/store';

// ============================================
// Legacy exports for backwards compatibility
// ============================================
export * from './use-environment';
