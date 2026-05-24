'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export interface Benefit {
  id: number;
  text: string;
  is_active: boolean;
}

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
  included_services?: number[];
  benefits_list?: Benefit[];
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

  const addBenefit = useMutation({
    mutationFn: ({ planId, text }: { planId: number, text: string }) => 
      post<Benefit>(`/api/subscriptions/plans/${planId}/benefits/`, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Benefit added');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add benefit')
  });

  const removeBenefit = useMutation({
    mutationFn: ({ planId, benefitId }: { planId: number, benefitId: number }) => 
      del(`/api/subscriptions/plans/${planId}/benefits/${benefitId}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Benefit removed');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove benefit')
  });

  const updateBenefit = useMutation({
    mutationFn: ({ planId, benefitId, text, is_active }: { planId: number, benefitId: number, text?: string, is_active?: boolean }) => 
      patch<Benefit>(`/api/subscriptions/plans/${planId}/benefits/${benefitId}/`, { text, is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Benefit updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update benefit')
  });

  return {
    ...query,
    createPlan,
    updatePlan,
    deletePlan,
    addBenefit,
    removeBenefit,
    updateBenefit
  };
};
