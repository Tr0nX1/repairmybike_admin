'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export interface StaticPage {
  id: number;
  key: string;
  title: string;
  body: string;
  is_active: boolean;
  updated_at: string;
}

const normalizePages = (response: PaginatedResponse<StaticPage> | ApiResponse<StaticPage[]> | StaticPage[] | undefined): StaticPage[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if ('results' in response && Array.isArray(response.results)) {
    return response.results;
  }

  if ('data' in response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to update static content';
};

export const useContent = () => {
  const queryClient = useQueryClient();
  const baseUrl = '/api/content/static-content/';

  const pagesQuery = useQuery<StaticPage[]>({
    queryKey: ['static-content'],
    queryFn: async () => {
      const response = await get<PaginatedResponse<StaticPage> | ApiResponse<StaticPage[]>>(baseUrl);
      return normalizePages(response);
    },
  });

  const createPage = useMutation({
    mutationFn: (data: Omit<StaticPage, 'id' | 'updated_at'>) =>
      post<StaticPage>(baseUrl, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-content'] });
      toast.success('Static content created');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Failed to create static content')
  });

  const updatePage = useMutation({
    mutationFn: ({ key, ...data }: Partial<StaticPage> & { key: string }) =>
      patch<StaticPage>(`${baseUrl}${key}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-content'] });
      toast.success('Static content updated');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Failed to update static content')
  });

  const deletePage = useMutation({
    mutationFn: (key: string) => del(`${baseUrl}${key}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-content'] });
      toast.success('Static content deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error) || 'Failed to delete static content')
  });

  return {
    pages: pagesQuery.data || [],
    isLoading: pagesQuery.isLoading,
    createPage,
    updatePage,
    deletePage,
  };
};
