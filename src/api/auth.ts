import { config } from '@/config';
import { apiClient, handleApiResponse } from '@/lib/api';
import type {
  AuthResponse,
  DjangoAuthResponse,
  DjangoUserResponse,
  LoginCredentials,
  MagicLinkRequest,
  RegisterCredentials,
  User,
} from '@/types';
import {
  normalizeAuthResponse,
  normalizeUser,
  toDjangoRegisterCredentials,
} from '@/types/auth';

/**
 * Determine auth endpoint paths based on backend configuration
 * Django Ninja JWT typically uses /token/pair for login
 */
const getAuthPaths = () => {
  const isDjango = config.env.mode === 'django-spa';
  return {
    login: isDjango ? '/token/pair' : '/auth/login',
    register: isDjango ? '/users/register' : '/auth/register',
    refresh: isDjango ? '/token/refresh' : '/auth/refresh',
    profile: isDjango ? '/users/me' : '/auth/profile',
    magicLink: '/auth/magic-link',
    verifyMagicLink: '/auth/verify-magic-link',
    logout: '/auth/logout',
    changePassword: isDjango
      ? '/users/change-password'
      : '/auth/change-password',
    requestPasswordReset: isDjango
      ? '/users/request-password-reset'
      : '/auth/request-password-reset',
    resetPassword: isDjango ? '/users/reset-password' : '/auth/reset-password',
  };
};

export const authApi = {
  /**
   * Login with email and password
   * Handles both standard and Django Ninja JWT formats
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const paths = getAuthPaths();
    const isDjango = config.env.mode === 'django-spa';

    // Django Ninja JWT expects 'username' or 'email' field
    const payload = isDjango
      ? { email: credentials.email, password: credentials.password }
      : credentials;

    const response = await apiClient.post<AuthResponse | DjangoAuthResponse>(
      paths.login,
      payload
    );
    const data = handleApiResponse(response);
    return normalizeAuthResponse(data);
  },

  /**
   * Register new user
   * Converts to Django snake_case format when needed
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const paths = getAuthPaths();
    const isDjango = config.env.mode === 'django-spa';

    const payload = isDjango
      ? toDjangoRegisterCredentials(credentials)
      : credentials;

    const response = await apiClient.post<AuthResponse | DjangoAuthResponse>(
      paths.register,
      payload
    );
    const data = handleApiResponse(response);
    return normalizeAuthResponse(data);
  },

  /**
   * Send magic link for passwordless login
   */
  magicLink: async (
    request: MagicLinkRequest
  ): Promise<{ message: string }> => {
    const paths = getAuthPaths();
    const response = await apiClient.post<{ message: string }>(
      paths.magicLink,
      request
    );
    return handleApiResponse(response);
  },

  /**
   * Verify magic link token
   */
  verifyMagicLink: async (token: string): Promise<AuthResponse> => {
    const paths = getAuthPaths();
    const response = await apiClient.post<AuthResponse | DjangoAuthResponse>(
      paths.verifyMagicLink,
      { token }
    );
    const data = handleApiResponse(response);
    return normalizeAuthResponse(data);
  },

  /**
   * Refresh access token
   * Handles both standard and Django Ninja JWT formats
   */
  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string }> => {
    const paths = getAuthPaths();
    const isDjango = config.env.mode === 'django-spa';

    // Django Ninja JWT expects 'refresh' field
    const payload = isDjango ? { refresh: refreshToken } : { refreshToken };

    const response = await apiClient.post<
      { accessToken: string } | { access: string }
    >(paths.refresh, payload);
    const data = handleApiResponse(response);

    // Normalize response
    if ('access' in data) {
      return { accessToken: data.access };
    }
    return data;
  },

  /**
   * Logout and invalidate tokens
   */
  logout: async (): Promise<{ message: string }> => {
    const paths = getAuthPaths();
    try {
      const response = await apiClient.post<{ message: string }>(paths.logout);
      return handleApiResponse(response);
    } catch {
      // Many Django setups don't have a logout endpoint - just return success
      return { message: 'Logged out successfully' };
    }
  },

  /**
   * Get current user profile
   * Normalizes Django snake_case response to camelCase
   */
  getProfile: async (): Promise<User> => {
    const paths = getAuthPaths();
    const response = await apiClient.get<User | DjangoUserResponse>(
      paths.profile
    );
    const data = handleApiResponse(response);

    // Normalize if Django format
    if ('first_name' in data) {
      return normalizeUser(data as DjangoUserResponse);
    }
    return data as User;
  },

  /**
   * Update user profile
   * Converts to snake_case for Django
   */
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const paths = getAuthPaths();
    const isDjango = config.env.mode === 'django-spa';

    // Convert to snake_case for Django
    const payload = isDjango
      ? {
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
        }
      : updates;

    const response = await apiClient.patch<User | DjangoUserResponse>(
      paths.profile,
      payload
    );
    const data = handleApiResponse(response);

    // Normalize if Django format
    if ('first_name' in data) {
      return normalizeUser(data as DjangoUserResponse);
    }
    return data as User;
  },

  /**
   * Change password
   */
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const paths = getAuthPaths();
    const isDjango = config.env.mode === 'django-spa';

    const payload = isDjango
      ? {
          old_password: data.currentPassword,
          new_password: data.newPassword,
        }
      : data;

    const response = await apiClient.post<{ message: string }>(
      paths.changePassword,
      payload
    );
    return handleApiResponse(response);
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const paths = getAuthPaths();
    const response = await apiClient.post<{ message: string }>(
      paths.requestPasswordReset,
      { email }
    );
    return handleApiResponse(response);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const paths = getAuthPaths();
    const isDjango = config.env.mode === 'django-spa';

    const payload = isDjango
      ? { token: data.token, new_password: data.newPassword }
      : data;

    const response = await apiClient.post<{ message: string }>(
      paths.resetPassword,
      payload
    );
    return handleApiResponse(response);
  },
};
