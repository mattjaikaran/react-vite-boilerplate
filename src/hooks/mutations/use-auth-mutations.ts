/**
 * Auth Mutation Hooks
 * React Query hooks for auth mutations (login, register, etc.)
 */

import { authKeys, authService } from '@/lib/api/services';
import { useAuth, useUI } from '@/lib/store';
import type {
  AuthResponse,
  LoginCredentials,
  MagicLinkRequest,
  RegisterCredentials,
  User,
} from '@/types';
import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

/**
 * Hook for user login
 */
export const useLogin = (
  options?: Omit<
    UseMutationOptions<AuthResponse, Error, LoginCredentials>,
    'mutationFn'
  >
) => {
  const { login } = useAuth();
  const { addNotification } = useUI();
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: authService.login,
    onSuccess: data => {
      login(data as any);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have been successfully logged in.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for user registration
 */
export const useRegister = (
  options?: Omit<
    UseMutationOptions<AuthResponse, Error, RegisterCredentials>,
    'mutationFn'
  >
) => {
  const { register } = useAuth();
  const { addNotification } = useUI();

  return useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: authService.register,
    onSuccess: data => {
      register(data as any);
      addNotification({
        type: 'success',
        title: 'Account created!',
        message: 'Your account has been successfully created.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Registration failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for sending magic link
 */
export const useMagicLink = (
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, MagicLinkRequest>,
    'mutationFn'
  >
) => {
  const { addNotification } = useUI();

  return useMutation<{ message: string }, Error, MagicLinkRequest>({
    mutationFn: authService.sendMagicLink,
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Magic link sent!',
        message: 'Check your email for the login link.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Failed to send magic link',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for verifying magic link
 */
export const useVerifyMagicLink = (
  options?: Omit<UseMutationOptions<AuthResponse, Error, string>, 'mutationFn'>
) => {
  const { login } = useAuth();
  const { addNotification } = useUI();

  return useMutation<AuthResponse, Error, string>({
    mutationFn: authService.verifyMagicLink,
    onSuccess: data => {
      login(data as any);
      addNotification({
        type: 'success',
        title: 'Logged in!',
        message: 'Magic link verified successfully.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Verification failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for user logout
 */
export const useLogout = (
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, void>,
    'mutationFn'
  >
) => {
  const { logout } = useAuth();
  const { addNotification } = useUI();
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, void>({
    mutationFn: authService.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      addNotification({
        type: 'success',
        title: 'Logged out',
        message: 'You have been successfully logged out.',
      });
    },
    onError: () => {
      // Still logout locally even if API call fails
      logout();
      queryClient.clear();
      addNotification({
        type: 'warning',
        title: 'Logged out',
        message: 'You have been logged out locally.',
      });
    },
    ...options,
  });
};

/**
 * Hook for updating user profile
 */
export const useUpdateProfile = (
  options?: Omit<UseMutationOptions<User, Error, Partial<User>>, 'mutationFn'>
) => {
  const { addNotification } = useUI();
  const queryClient = useQueryClient();

  return useMutation<User, Error, Partial<User>>({
    mutationFn: authService.updateProfile,
    onSuccess: data => {
      queryClient.setQueryData(authKeys.profile(), data);
      addNotification({
        type: 'success',
        title: 'Profile updated',
        message: 'Your profile has been updated successfully.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for changing password
 */
export const useChangePassword = (
  options?: Omit<
    UseMutationOptions<
      { message: string },
      Error,
      { currentPassword: string; newPassword: string }
    >,
    'mutationFn'
  >
) => {
  const { addNotification } = useUI();

  return useMutation<
    { message: string },
    Error,
    { currentPassword: string; newPassword: string }
  >({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been changed successfully.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Password change failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for requesting password reset
 */
export const useRequestPasswordReset = (
  options?: Omit<
    UseMutationOptions<{ message: string }, Error, string>,
    'mutationFn'
  >
) => {
  const { addNotification } = useUI();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: authService.requestPasswordReset,
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Reset email sent',
        message: 'Check your email for password reset instructions.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Request failed',
        message: error.message,
      });
    },
    ...options,
  });
};

/**
 * Hook for resetting password with token
 */
export const useResetPassword = (
  options?: Omit<
    UseMutationOptions<
      { message: string },
      Error,
      { token: string; newPassword: string }
    >,
    'mutationFn'
  >
) => {
  const { addNotification } = useUI();

  return useMutation<
    { message: string },
    Error,
    { token: string; newPassword: string }
  >({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Password reset',
        message: 'Your password has been reset. You can now log in.',
      });
    },
    onError: error => {
      addNotification({
        type: 'error',
        title: 'Reset failed',
        message: error.message,
      });
    },
    ...options,
  });
};
