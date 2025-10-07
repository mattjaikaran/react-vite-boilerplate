import type {
  AuthState,
  AuthTokens,
  LoginCredentials,
  MagicLinkRequest,
  RegisterCredentials,
  User,
} from '@/types';
import { StateCreator } from 'zustand';

export interface AuthSlice extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  magicLink: (request: MagicLinkRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  ...initialState,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      // This will be replaced with actual API call
      const mockResponse = {
        user: {
          id: '1',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      // Store tokens in localStorage
      localStorage.setItem('auth_token', mockResponse.tokens.accessToken);
      localStorage.setItem('refresh_token', mockResponse.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));

      set({
        user: mockResponse.user,
        tokens: mockResponse.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });

    try {
      // This will be replaced with actual API call
      const mockResponse = {
        user: {
          id: '1',
          email: credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      // Store tokens in localStorage
      localStorage.setItem('auth_token', mockResponse.tokens.accessToken);
      localStorage.setItem('refresh_token', mockResponse.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));

      set({
        user: mockResponse.user,
        tokens: mockResponse.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      });
    }
  },

  magicLink: async (_request: MagicLinkRequest) => {
    set({ isLoading: true, error: null });

    try {
      // This will be replaced with actual API call
      // For now, just simulate sending magic link
      await new Promise(resolve => setTimeout(resolve, 1000));

      set({
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Magic link failed',
      });
    }
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  refreshToken: async () => {
    const { tokens } = get();
    if (!tokens?.refreshToken) return;

    set({ isLoading: true });

    try {
      // This will be replaced with actual API call
      const mockTokens = {
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
      };

      localStorage.setItem('auth_token', mockTokens.accessToken);
      localStorage.setItem('refresh_token', mockTokens.refreshToken);

      set({
        tokens: mockTokens,
        isLoading: false,
      });
    } catch (error) {
      // If refresh fails, logout user
      get().logout();
    }
  },

  setUser: (user: User) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },

  setTokens: (tokens: AuthTokens) => {
    set({ tokens });
    localStorage.setItem('auth_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    try {
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userStr = localStorage.getItem('user');

      if (token && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          tokens: { accessToken: token, refreshToken },
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear corrupted data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },
});
