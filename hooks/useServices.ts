'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

export interface Service {
  id: number;
  name: string;
  description: string;
  service_category: number;
  is_featured: boolean;
  specifications: any;
  images: any;
}

export const useServices = (filters: any = {}, page: number = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Service[]; count: number }>({
    queryKey: ['services', filters, page],
    queryFn: async () => {
      const params = { ...filters, page };
      const response = await get<PaginatedResponse<Service>>('/api/services/services/', { params });
      if (response.results !== undefined) {
         return { data: response.results, count: response.count };
      }
      const apiResponse = response as unknown as ApiResponse<Service[]>;
      return {
        data: apiResponse.data || [],
        count: apiResponse.data?.length || 0
      };
    },
  });

  const createService = useMutation({
    mutationFn: (data: Partial<Service>) => post<ApiResponse<Service>>('/api/services/services/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create service')
  });

  const updateService = useMutation({
    mutationFn: ({ id, ...data }: Partial<Service> & { id: number }) => 
      patch<ApiResponse<Service>>(`/api/services/services/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated successfully');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update service')
  });

  const deleteService = useMutation({
    mutationFn: (id: number) => del(`/api/services/services/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete service')
  });

  return {
    ...query,
    createService,
    updateService,
    deleteService
  };
};
