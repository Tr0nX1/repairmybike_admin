'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export interface ServicePricing {
  id: number;
  service: number;
  service_name?: string;
  vehicle_model: number;
  vehicle_model_name?: string;
  price: string;
}

export const useServicePricing = (filters: any = {}, page: number = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: ServicePricing[]; count: number }>({
    queryKey: ['service-pricing', filters, page],
    queryFn: async () => {
      const params = { ...filters, page };
      try {
        const response = await get<PaginatedResponse<ServicePricing>>('/api/services/service-pricing/', { params });
        if (response.results !== undefined) {
           return { data: response.results, count: response.count };
        }
        // Fallback if backend doesn't paginate this endpoint
        const apiResponse = response as unknown as ApiResponse<ServicePricing[]>;
        return { data: apiResponse.data || [], count: apiResponse.data?.length || 0 };
      } catch (err) {
         console.error("Error fetching service pricing", err);
         return { data: [], count: 0 };
      }
    },
  });

  const createPricing = useMutation({
    mutationFn: (data: Partial<ServicePricing>) => post<ApiResponse<ServicePricing>>('/api/services/service-pricing/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-pricing'] });
      toast.success('Labor rate added successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create pricing')
  });

  const updatePricing = useMutation({
    mutationFn: ({ id, ...data }: Partial<ServicePricing> & { id: number }) => 
      patch<ApiResponse<ServicePricing>>(`/api/services/service-pricing/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-pricing'] });
      toast.success('Labor rate updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update pricing')
  });

  const deletePricing = useMutation({
    mutationFn: (id: number) => del(`/api/services/service-pricing/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-pricing'] });
      toast.success('Labor rate removed');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete pricing')
  });

  return {
    ...query,
    createPricing,
    updatePricing,
    deletePricing
  };
};
