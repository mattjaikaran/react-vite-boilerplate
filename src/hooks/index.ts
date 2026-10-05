/**
 * Hooks Exports
 * Central export point for all React hooks
 */

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
  useToggleTheme,
  useUI,
} from '@/lib/store';

export * from './use-environment';
