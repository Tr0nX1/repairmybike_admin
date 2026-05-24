'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient, { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  image?: {
    thumbnail: string;
    original: string;
    alt_text: string;
  } | null;
  service_count?: number;
  created_at?: string;
  updated_at?: string;
}

export const useServiceCategories = () => {
  const queryClient = useQueryClient();

  const query = useQuery<ServiceCategory[]>({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const response = await get<ApiResponse<ServiceCategory[]> | ServiceCategory[]>('/api/services/service-categories/');
      if (Array.isArray(response)) {
        return response;
      }
      return response.data || [];
    },
  });

  const createCategory = useMutation({
    mutationFn: (data: FormData) => 
      apiClient.post('/api/services/service-categories/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast.success('Category created successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create category');
    }
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => 
      apiClient.patch(`/api/services/service-categories/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update category');
    }
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => del(`/api/services/service-categories/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete category');
    }
  });

  return {
    ...query,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
