/**
 * Server Actions Pattern
 *
 * This module provides patterns for server actions that can be used
 * with SSR or migrated to RSC-enabled frameworks.
 *
 * In Vite with SSR:
 * - These functions run during SSR on the server
 * - On client navigation, they trigger API calls
 *
 * In Next.js with RSC:
 * - Mark these with 'use server' directive
 * - They become true server actions
 */

import { authService, todoService } from '@/lib/api/services';
import type {
  CreateTodoRequest,
  LoginCredentials,
  RegisterCredentials,
  Todo,
  UpdateTodoRequest,
} from '@/types';

/**
 * Server action type definition
 */
export type ServerAction<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

/**
 * Create a form action wrapper
 * Converts a server action to work with form submissions
 */
export function createFormAction<TInput, TOutput>(
  action: ServerAction<TInput, TOutput>
) {
  return async (formData: FormData): Promise<TOutput> => {
    const data = Object.fromEntries(formData.entries()) as unknown as TInput;
    return action(data);
  };
}

// ============================================
// Todo Server Actions
// ============================================

/**
 * Create todo server action
 */
export const createTodoAction: ServerAction<
  CreateTodoRequest,
  Todo
> = async data => {
  // 'use server' - Add this directive when migrating to Next.js
  return todoService.create(data);
};

/**
 * Update todo server action
 */
export const updateTodoAction: ServerAction<
  { id: string; updates: UpdateTodoRequest },
  Todo
> = async ({ id, updates }) => {
  // 'use server'
  return todoService.update(id, updates);
};

/**
 * Delete todo server action
 */
export const deleteTodoAction: ServerAction<
  string,
  { message: string }
> = async id => {
  // 'use server'
  return todoService.delete(id);
};

/**
 * Toggle todo server action
 */
export const toggleTodoAction: ServerAction<string, Todo> = async id => {
  // 'use server'
  return todoService.toggle(id);
};

// ============================================
// Auth Server Actions
// ============================================

/**
 * Login server action
 */
export const loginAction: ServerAction<
  LoginCredentials,
  { success: boolean }
> = async credentials => {
  // 'use server'
  try {
    await authService.login(credentials);
    return { success: true };
  } catch {
    return { success: false };
  }
};

/**
 * Register server action
 */
export const registerAction: ServerAction<
  RegisterCredentials,
  { success: boolean }
> = async credentials => {
  // 'use server'
  try {
    await authService.register(credentials);
    return { success: true };
  } catch {
    return { success: false };
  }
};

/**
 * Logout server action
 */
export const logoutAction: ServerAction<
  void,
  { success: boolean }
> = async () => {
  // 'use server'
  try {
    await authService.logout();
    return { success: true };
  } catch {
    return { success: false };
  }
};

// ============================================
// Form Action Wrappers
// ============================================

export const createTodoFormAction = createFormAction(createTodoAction);
export const loginFormAction = createFormAction(loginAction);
export const registerFormAction = createFormAction(registerAction);
