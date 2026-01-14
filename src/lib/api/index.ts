/**
 * API Layer Exports
 * Extended services and utilities for the API layer
 *
 * Note: Base api client exports come from @/lib/api (the original api.ts file)
 * This module provides service classes and additional utilities
 */

// Services
export {
  authKeys,
  authService,
  BaseService,
  todoKeys,
  todoService,
} from './services';
export type { BulkDeleteResponse, ServiceConfig, TodoStats } from './services';

// Utilities
export {
  createErrorResponse,
  createPaginatedKey,
  createQueryKeyFactory,
  createSuccessResponse,
  handlePaginatedResponse,
  serializeParams,
} from './utils';
