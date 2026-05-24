'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export interface UserRoleFilters {
  search?: string;
  role?: 'all' | 'staff' | 'manager' | 'superuser';
  status?: 'all' | 'active' | 'inactive';
}

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  phone_number?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_manager: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface RoleUpdatePayload {
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_manager?: boolean;
}

export const useUsers = (filters: UserRoleFilters = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery<UserListItem[]>({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (filters.search?.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.role && filters.role !== 'all') {
        params.role = filters.role;
      }

      if (filters.status === 'active') {
        params.is_active = 'true';
      } else if (filters.status === 'inactive') {
        params.is_active = 'false';
      }

      const response = await get<PaginatedResponse<UserListItem> | ApiResponse<UserListItem[]>>(
        '/api/staff/users/',
        { params }
      );

      if (response && 'results' in response) {
        return response.results;
      }

      if (response && (response as ApiResponse<UserListItem[]>).data) {
        const apiResponse = response as ApiResponse<UserListItem[]>;
        return apiResponse.data || [];
      }

      return [];
    }
  });

  const updateUserRoles = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: RoleUpdatePayload }) =>
      patch<ApiResponse<UserListItem>>(`/api/staff/users/${id}/roles/`, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', filters] });
    },
  });

  return {
    ...query,
    updateUserRoles,
  };
};
