/**
 * Auth Service
 * Handles all authentication-related API calls
 */

import { api, handleApiResponse } from '@/lib/api';
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  MagicLinkRequest,
  RegisterCredentials,
  User,
} from '@/types';
import { createQueryKeyFactory } from '../utils/query-keys';

/**
 * Auth query keys for React Query cache management
 */
export const authKeys = {
  ...createQueryKeyFactory('auth'),
  profile: () => ['auth', 'profile'] as const,
  session: () => ['auth', 'session'] as const,
};

/**
 * Authentication Service
 */
class AuthServiceClass {
  private readonly basePath = '/auth';

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${this.basePath}/login`,
      credentials
    );
    return handleApiResponse(response);
  }

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${this.basePath}/register`,
      credentials
    );
    return handleApiResponse(response);
  }

  /**
   * Send magic link for passwordless login
   */
  async sendMagicLink(request: MagicLinkRequest): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `${this.basePath}/magic-link`,
      request
    );
    return handleApiResponse(response);
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      `${this.basePath}/verify-magic-link`,
      { token }
    );
    return handleApiResponse(response);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      `${this.basePath}/refresh`,
      { refreshToken }
    );
    return handleApiResponse(response);
  }

  /**
   * Logout and invalidate tokens
   */
  async logout(): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `${this.basePath}/logout`
    );
    return handleApiResponse(response);
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(
      `${this.basePath}/profile`
    );
    return handleApiResponse(response);
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(
      `${this.basePath}/profile`,
      updates
    );
    return handleApiResponse(response);
  }

  /**
   * Change password
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `${this.basePath}/change-password`,
      data
    );
    return handleApiResponse(response);
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `${this.basePath}/request-password-reset`,
      { email }
    );
    return handleApiResponse(response);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `${this.basePath}/reset-password`,
      data
    );
    return handleApiResponse(response);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `${this.basePath}/verify-email`,
      { token }
    );
    return handleApiResponse(response);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `${this.basePath}/resend-verification`
    );
    return handleApiResponse(response);
  }
}

// Export singleton instance
export const authService = new AuthServiceClass();
