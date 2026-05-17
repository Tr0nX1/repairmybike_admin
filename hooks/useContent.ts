'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

export interface StaticPage {
  key: string;
  title: string;
  body: string;
  is_active: boolean;
  updated_at: string;
}

export const useContent = () => {
  const queryClient = useQueryClient();

  const pagesQuery = useQuery<StaticPage[]>({
    queryKey: ['static-pages'],
    queryFn: async () => {
      const response = await get<ApiResponse<StaticPage[]>>('/api/content/pages/');
      return response.data;
    },
  });

  const updatePage = useMutation({
    mutationFn: ({ key, ...data }: Partial<StaticPage> & { key: string }) => 
      patch<ApiResponse<StaticPage>>(`/api/content/pages/${key}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      toast.success('Page updated successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update page')
  });

  return {
    pages: pagesQuery.data || [],
    isLoading: pagesQuery.isLoading,
    updatePage
  };
};
