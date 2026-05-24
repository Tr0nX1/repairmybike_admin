'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export const useSubscriptions = (filters: any = {}, page: number = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: any[]; count: number }>({
    queryKey: ['subscriptions', filters, page],
    queryFn: async () => {
      const params = { ...filters, page };
      const response = await get<PaginatedResponse<any>>('/api/subscriptions/subscriptions/', { params });
      if (response.results !== undefined) {
         return { data: response.results, count: response.count };
      }
      const apiResponse = response as unknown as ApiResponse<any[]>;
      return {
        data: apiResponse.data || [],
        count: apiResponse.data?.length || 0
      };
    },
  });

  const adjustVisits = useMutation({
    mutationFn: ({ id, adjustment, reason }: { id: number, adjustment: number, reason: string }) =>
      post(`/api/subscriptions/subscriptions/${id}/adjust-visits/`, { adjustment, reason }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.id] });
      toast.success('Visits adjusted successfully');
    },
    onError: (err: any) => {
      const message = err?.message || 'Failed to adjust visits';
      toast.error(message);
      return Promise.reject(err);
    }
  });

  const approveSubscription = useMutation({
    mutationFn: (id: number) =>
      post(`/api/subscriptions/subscriptions/${id}/approve/`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription approved — customer notified');
    },
    onError: (err: any) => {
      const message = err?.code === 'INVALID_STATUS' ? 'This subscription cannot be approved' : (err?.message || 'Failed to approve subscription');
      toast.error(message);
      return Promise.reject(err);
    }
  });

  const rejectSubscription = useMutation({
    mutationFn: ({ id, reason }: { id: number, reason: string }) =>
      post(`/api/subscriptions/subscriptions/${id}/reject/`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription rejected — customer notified');
    },
    onError: (err: any) => {
      const message = err?.code === 'INVALID_STATUS' ? 'This subscription cannot be rejected' : (err?.message || 'Failed to reject subscription');
      toast.error(message);
      return Promise.reject(err);
    }
  });

  return { ...query, adjustVisits, approveSubscription, rejectSubscription };
};
