import { apiErrorMessage } from '@/api/error';
import { authGetCurrentUser } from '@/api/generated/sdk.gen';
import type { UserSchema } from '@/api/generated/types.gen';
import type { StateCreator } from 'zustand';

export interface AuthSlice {
  user: UserSchema | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserSchema) => void;
  clearSession: () => void;
  initializeAuth: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = set => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  setUser: user =>
    set({ user, isAuthenticated: true, isLoading: false, error: null }),
  clearSession: () =>
    set({ user: null, isAuthenticated: false, isLoading: false, error: null }),
  initializeAuth: async () => {
    const result = await authGetCurrentUser();
    if (result.data) {
      set({
        user: result.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error:
          result.response?.status === 401
            ? null
            : apiErrorMessage(result.error),
      });
    }
  },
});
