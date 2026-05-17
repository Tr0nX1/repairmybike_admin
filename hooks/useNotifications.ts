'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export interface Notification {
  id: number;
  user: number;
  user_username?: string;
  title: string;
  message: string;
  notification_type: 'booking_update' | 'promotion' | 'system' | 'payment';
  is_read: boolean;
  created_at: string;
}

export const useNotifications = (filters: any = {}, page: number = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Notification[]; count: number }>({
    queryKey: ['notifications', filters, page],
    queryFn: async () => {
      const params = { ...filters, page };
      try {
        const response = await get<PaginatedResponse<Notification>>('/api/notifications/', { params });
        if (response.results !== undefined) {
           return { data: response.results, count: response.count };
        }
        const apiResponse = response as unknown as ApiResponse<Notification[]>;
        return { data: apiResponse.data || [], count: apiResponse.data?.length || 0 };
      } catch (err) {
        return { data: [], count: 0 };
      }
    },
  });

  const createNotification = useMutation({
    mutationFn: (data: Partial<Notification>) => post<ApiResponse<Notification>>('/api/notifications/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to send notification')
  });

  const markAsRead = useMutation({
    mutationFn: (id: number) => post(`/api/notifications/${id}/mark-read/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllRead = useMutation({
    mutationFn: () => post('/api/notifications/mark-all-read/', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    }
  });

  return {
    ...query,
    createNotification,
    markAsRead,
    markAllRead
  };
};
