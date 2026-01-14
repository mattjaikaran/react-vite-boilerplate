/**
 * Base Service Class
 * Provides common CRUD operations for API services
 */

import { api, handleApiResponse } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/types';
import { AxiosRequestConfig } from 'axios';
import { handlePaginatedResponse } from '../utils';

export interface ServiceConfig {
  basePath: string;
}

/**
 * Abstract base service with common CRUD operations
 */
export abstract class BaseService<
  TEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TEntity>,
> {
  protected readonly basePath: string;

  constructor(config: ServiceConfig) {
    this.basePath = config.basePath;
  }

  /**
   * Get all entities with optional pagination and filtering
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<TEntity>> {
    const response = await api.get<ApiResponse<PaginatedResponse<TEntity>>>(
      this.basePath,
      { params }
    );
    return handlePaginatedResponse(response);
  }

  /**
   * Get a single entity by ID
   */
  async getById(id: string): Promise<TEntity> {
    const response = await api.get<ApiResponse<TEntity>>(
      `${this.basePath}/${id}`
    );
    return handleApiResponse(response);
  }

  /**
   * Create a new entity
   */
  async create(data: TCreateDto): Promise<TEntity> {
    const response = await api.post<ApiResponse<TEntity>>(this.basePath, data);
    return handleApiResponse(response);
  }

  /**
   * Update an existing entity
   */
  async update(id: string, data: TUpdateDto): Promise<TEntity> {
    const response = await api.patch<ApiResponse<TEntity>>(
      `${this.basePath}/${id}`,
      data
    );
    return handleApiResponse(response);
  }

  /**
   * Replace an existing entity
   */
  async replace(id: string, data: TCreateDto): Promise<TEntity> {
    const response = await api.put<ApiResponse<TEntity>>(
      `${this.basePath}/${id}`,
      data
    );
    return handleApiResponse(response);
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `${this.basePath}/${id}`
    );
    return handleApiResponse(response);
  }

  /**
   * Protected helper for custom GET requests
   */
  protected async get<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.get<ApiResponse<T>>(
      `${this.basePath}${path}`,
      config
    );
    return handleApiResponse(response);
  }

  /**
   * Protected helper for custom POST requests
   */
  protected async post<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.post<ApiResponse<T>>(
      `${this.basePath}${path}`,
      data,
      config
    );
    return handleApiResponse(response);
  }

  /**
   * Protected helper for custom PATCH requests
   */
  protected async patch<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await api.patch<ApiResponse<T>>(
      `${this.basePath}${path}`,
      data,
      config
    );
    return handleApiResponse(response);
  }
}
