import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createAuthSlice, type AuthSlice } from './slices/authSlice';
import { createTodoSlice, type TodoSlice } from './slices/todoSlice';
import { createUISlice, type UISlice } from './slices/uiSlice';

// Combined store type
export type AppStore = AuthSlice & TodoSlice & UISlice;

// Create the store with all slices
export const useStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createAuthSlice(...args),
        ...createTodoSlice(...args),
        ...createUISlice(...args),
      }),
      {
        name: 'app-store',
        partialize: state => ({
          // Only persist UI theme and auth tokens
          theme: state.theme,
          // Don't persist auth state as it's handled separately in localStorage
          // Don't persist todos as they should be fetched fresh
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selector hooks for better performance
export const useAuth = () =>
  useStore(state => ({
    user: state.user,
    tokens: state.tokens,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    register: state.register,
    magicLink: state.magicLink,
    logout: state.logout,
    refreshToken: state.refreshToken,
    setUser: state.setUser,
    setTokens: state.setTokens,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    initializeAuth: state.initializeAuth,
  }));

export const useTodos = () =>
  useStore(state => ({
    todos: state.todos,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    fetchTodos: state.fetchTodos,
    createTodo: state.createTodo,
    updateTodo: state.updateTodo,
    deleteTodo: state.deleteTodo,
    toggleTodo: state.toggleTodo,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
  }));

export const useUI = () =>
  useStore(state => ({
    theme: state.theme,
    sidebarOpen: state.sidebarOpen,
    notifications: state.notifications,
    setTheme: state.setTheme,
    toggleTheme: state.toggleTheme,
    setSidebarOpen: state.setSidebarOpen,
    toggleSidebar: state.toggleSidebar,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
  }));

// Initialize auth on app start
export const initializeStore = () => {
  const { initializeAuth } = useStore.getState();
  initializeAuth();
};
