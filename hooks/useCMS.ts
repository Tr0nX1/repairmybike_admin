'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  start_date?: string;
  end_date?: string;
}

export const useCMS = () => {
  const queryClient = useQueryClient();

  const bannersQuery = useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await get<ApiResponse<Banner[]>>('/api/cms/banners/');
      return response.data;
    },
  });

  const createBanner = useMutation({
    mutationFn: (data: Partial<Banner>) => post<ApiResponse<Banner>>('/api/cms/banners/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner created successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create banner')
  });

  const updateBanner = useMutation({
    mutationFn: ({ id, ...data }: Partial<Banner> & { id: number }) => 
      patch<ApiResponse<Banner>>(`/api/cms/banners/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update banner')
  });

  const deleteBanner = useMutation({
    mutationFn: (id: number) => del(`/api/cms/banners/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Banner removed');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete banner')
  });

  return {
    banners: bannersQuery.data || [],
    isLoading: bannersQuery.isLoading,
    createBanner,
    updateBanner,
    deleteBanner
  };
};
