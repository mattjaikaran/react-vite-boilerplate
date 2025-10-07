import { apiClient, handleApiResponse } from '@/lib/api';
import type {
  AuthResponse,
  LoginCredentials,
  MagicLinkRequest,
  RegisterCredentials,
  User,
} from '@/types';

export const authApi = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    return handleApiResponse(response);
  },

  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );
    return handleApiResponse(response);
  },

  // Send magic link
  magicLink: async (
    request: MagicLinkRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/magic-link',
      request
    );
    return handleApiResponse(response);
  },

  // Verify magic link token
  verifyMagicLink: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/verify-magic-link',
      { token }
    );
    return handleApiResponse(response);
  },

  // Refresh access token
  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    return handleApiResponse(response);
  },

  // Logout (invalidate tokens)
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return handleApiResponse(response);
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/profile');
    return handleApiResponse(response);
  },

  // Update user profile
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>('/auth/profile', updates);
    return handleApiResponse(response);
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/change-password',
      data
    );
    return handleApiResponse(response);
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/request-password-reset',
      { email }
    );
    return handleApiResponse(response);
  },

  // Reset password with token
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/reset-password',
      data
    );
    return handleApiResponse(response);
  },
};
