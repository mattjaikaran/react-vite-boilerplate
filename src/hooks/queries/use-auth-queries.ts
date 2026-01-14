/**
 * Auth Query Hooks
 * React Query hooks for fetching auth-related data
 */

import { authKeys, authService } from '@/lib/api/services';
import { useAuth } from '@/lib/store';
import type { User } from '@/types';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

/**
 * Hook to fetch the current user's profile
 */
export const useProfile = (
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) => {
  const { isAuthenticated } = useAuth();

  return useQuery<User, Error>({
    queryKey: authKeys.profile(),
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Hook to check if user session is valid
 */
export const useSessionCheck = (
  options?: Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>
) => {
  const { isAuthenticated } = useAuth();

  return useQuery<boolean, Error>({
    queryKey: authKeys.session(),
    queryFn: async () => {
      try {
        await authService.getProfile();
        return true;
      } catch {
        return false;
      }
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    ...options,
  });
};

/**
 * Hook to get auth status with user data
 */
export const useAuthStatus = () => {
  const { isAuthenticated, user } = useAuth();
  const profileQuery = useProfile({ enabled: isAuthenticated && !user });

  return {
    isAuthenticated,
    isLoading: profileQuery.isLoading,
    user: user || profileQuery.data,
    error: profileQuery.error,
  };
};
