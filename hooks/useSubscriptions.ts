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
    mutationFn: ({ id, visits_to_add, reason }: { id: number, visits_to_add: number, reason: string }) =>
      post(`/api/subscriptions/subscriptions/${id}/adjust-visits/`, { visits_to_add, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Visits adjusted successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to adjust visits')
  });

  return { ...query, adjustVisits };
};
