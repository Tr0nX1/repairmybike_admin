'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { get } from '@/lib/api-client';

export interface StaffDirectoryItem {
  id: number;
  identifier: string;
  name: string | null;
  employee_id: string | null;
  role: string | null;
  is_active: boolean;
  email: string | null;
  photo: string | null;
  photo_url: string | null;
  is_manager: boolean;
  created_at: string;
}

export interface StaffDirectoryFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
}

export const useStaffDirectory = (filters: StaffDirectoryFilters = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery<StaffDirectoryItem[]>({
    queryKey: ['staff-directory', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (filters.search?.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.role && filters.role !== 'all') {
        params.role = filters.role;
      }

      if (typeof filters.is_active === 'boolean') {
        params.is_active = String(filters.is_active);
      }

      const response = await get<StaffDirectoryItem[] | { results: StaffDirectoryItem[] }>(
        '/api/auth/staff-directory/',
        { params }
      );

      if (Array.isArray(response)) {
        return response;
      }

      if (response && 'results' in response) {
        return response.results;
      }

      return [];
    },
  });

  const createStaff = useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await apiClient.post('/api/auth/staff-directory/', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
    },
  });

  const updateStaff = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: FormData }) => {
      const response = await apiClient.patch(`/api/auth/staff-directory/${id}/`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
    },
  });

  const deleteStaff = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/auth/staff-directory/${id}/`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-directory'] });
    },
  });

  return {
    ...query,
    createStaff,
    updateStaff,
    deleteStaff,
  };
};
