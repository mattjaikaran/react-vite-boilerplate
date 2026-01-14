/**
 * API Services Exports
 * Central export point for all API services
 */

// Base service for creating new services
export { BaseService } from './base.service';
export type { ServiceConfig } from './base.service';

// Auth service
export { authKeys, authService } from './auth.service';

// Todo service
export { todoKeys, todoService } from './todo.service';
export type { BulkDeleteResponse, TodoStats } from './todo.service';
