'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export interface Plan {
  id: number;
  name: string;
  slug: string;
  price: string;
  currency: string;
  billing_period: string;
  included_visits: number;
  active: boolean;
  description: string;
  tier: string;
}

export const usePlans = (page: number = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Plan[]; count: number }>({
    queryKey: ['plans', page],
    queryFn: async () => {
      const response = await get<PaginatedResponse<Plan>>('/api/subscriptions/plans/', { params: { page } });
      if (response.results !== undefined) {
         return { data: response.results, count: response.count };
      }
      const apiResponse = response as unknown as ApiResponse<Plan[]>;
      return {
        data: apiResponse.data || [],
        count: apiResponse.data?.length || 0
      };
    },
  });

  const createPlan = useMutation({
    mutationFn: (data: Partial<Plan>) => post<ApiResponse<Plan>>('/api/subscriptions/plans/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Subscription plan created');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create plan')
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, ...data }: Partial<Plan> & { id: number }) => 
      patch<ApiResponse<Plan>>(`/api/subscriptions/plans/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update plan')
  });

  const deletePlan = useMutation({
    mutationFn: (id: number) => del(`/api/subscriptions/plans/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete plan')
  });

  return {
    ...query,
    createPlan,
    updatePlan,
    deletePlan
  };
};
