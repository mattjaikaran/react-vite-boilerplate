import { api } from '@/lib/api';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

// Generic API hooks for basic CRUD operations
export const useApiGet = <TData = unknown, TError = Error>(
  url: string,
  options?: UseQueryOptions<TData, TError>
) => {
  return useQuery({
    queryKey: [url],
    queryFn: () => api.get<TData>(url).then(res => res.data),
    ...options,
  });
};

export const useApiPost = <
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  url: string,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation({
    mutationFn: (data: TVariables) =>
      api.post<TData>(url, data).then(res => res.data),
    ...options,
  });
};

export const useApiPut = <
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  url: string,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation({
    mutationFn: (data: TVariables) =>
      api.put<TData>(url, data).then(res => res.data),
    ...options,
  });
};

export const useApiPatch = <
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  url: string,
  options?: UseMutationOptions<TData, TError, TVariables>
) => {
  return useMutation({
    mutationFn: (data: TVariables) =>
      api.patch<TData>(url, data).then(res => res.data),
    ...options,
  });
};

export const useApiDelete = <TData = unknown, TError = Error>(
  url: string,
  options?: UseMutationOptions<TData, TError, void>
) => {
  return useMutation({
    mutationFn: () => api.delete<TData>(url).then(res => res.data),
    ...options,
  });
};
