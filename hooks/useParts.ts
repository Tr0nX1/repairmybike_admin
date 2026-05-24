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
    mutationFn: ({ id, data }: { id: number; data: Partial<SparePart> | FormData }) => 
      patch<ApiResponse<SparePart>>(`/api/spare-parts/parts/${id}/`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      }),
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

  const uploadThumbnail = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('thumbnail', file);
      return patch<ApiResponse<SparePart>>(`/api/spare-parts/parts/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Thumbnail updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to upload thumbnail')
  });

  const uploadGalleryImage = useMutation({
    mutationFn: ({ id, file, altText = '' }: { id: number; file: File, altText?: string }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('is_primary', 'false');
      formData.append('alt_text', altText);
      return post<ApiResponse<any>>(`/api/spare-parts/parts/${id}/upload-image/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Image added to gallery');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to upload image')
  });

  const deleteGalleryImage = useMutation({
    mutationFn: ({ partId, imageId }: { partId: number; imageId: number }) => 
      del(`/api/spare-parts/parts/${partId}/images/${imageId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Image removed from gallery');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove image')
  });

  return {
    ...query,
    createPart,
    updatePart,
    deletePart,
    uploadThumbnail,
    uploadGalleryImage,
    deleteGalleryImage
  };
};

export function useCategories() {
  const queryClient = useQueryClient();
  const query = useQuery<any[]>({
    queryKey: ['part-categories'],
    queryFn: async () => {
      const res = await get<any>('/api/spare-parts/categories/');
      if (res && (res as any).results !== undefined) {
        return (res as any).results;
      }
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
      if (res && (res as any).results !== undefined) {
        return (res as any).results;
      }
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
