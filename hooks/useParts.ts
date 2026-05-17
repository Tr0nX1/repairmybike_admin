'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch, post, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { SparePart } from '@/types/parts';
import { toast } from 'sonner';

export const useParts = (filters: any = {}, page: number = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: SparePart[]; count: number }>({
    queryKey: ['parts', filters, page],
    queryFn: async () => {
      const params = { ...filters, page };
      const response = await get<PaginatedResponse<SparePart>>('/api/spare-parts/parts/', { params });
      if (response.results !== undefined) {
         return { data: response.results, count: response.count };
      }
      const apiResponse = response as unknown as ApiResponse<SparePart[]>;
      return {
        data: apiResponse.data || [],
        count: apiResponse.data?.length || 0
      };
    },
  });

  const createPart = useMutation({
    mutationFn: (data: Partial<SparePart>) => post<ApiResponse<SparePart>>('/api/spare-parts/parts/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Part added to inventory');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add part')
  });

  const updatePart = useMutation({
    mutationFn: ({ id, ...data }: Partial<SparePart> & { id: number }) => 
      patch<ApiResponse<SparePart>>(`/api/spare-parts/parts/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Part updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update part');
    }
  });

  const deletePart = useMutation({
    mutationFn: (id: number) => del(`/api/spare-parts/parts/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Part removed from inventory');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete part')
  });

  return {
    ...query,
    createPart,
    updatePart,
    deletePart
  };
};

export function useCategories() {
  const queryClient = useQueryClient();
  const query = useQuery<any[]>({
    queryKey: ['part-categories'],
    queryFn: async () => {
      const res = await get<any>('/api/spare-parts/categories/');
      return (res.data || res) as any[];
    },
  });

  const createCategory = useMutation({
    mutationFn: (data: any) => post('/api/spare-parts/categories/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-categories'] });
      toast.success('Category created');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create category')
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData | any }) => patch(`/api/spare-parts/categories/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-categories'] });
      toast.success('Category updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update category')
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => del(`/api/spare-parts/categories/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-categories'] });
      toast.success('Category deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete category')
  });

  return { ...query, createCategory, updateCategory, deleteCategory };
}

export function useBrands() {
  const queryClient = useQueryClient();
  const query = useQuery<any[]>({
    queryKey: ['part-brands'],
    queryFn: async () => {
      const res = await get<any>('/api/spare-parts/brands/');
      return (res.data || res) as any[];
    },
  });

  const createBrand = useMutation({
    mutationFn: (data: FormData | any) => post('/api/spare-parts/brands/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-brands'] });
      toast.success('Brand created');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create brand')
  });

  const updateBrand = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData | any }) => patch(`/api/spare-parts/brands/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-brands'] });
      toast.success('Brand updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update brand')
  });

  const deleteBrand = useMutation({
    mutationFn: (id: number) => del(`/api/spare-parts/brands/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-brands'] });
      toast.success('Brand deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete brand')
  });

  return { ...query, createBrand, updateBrand, deleteBrand };
}
