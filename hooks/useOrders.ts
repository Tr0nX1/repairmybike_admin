'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export const useOrders = (filters: any = {}, page: number = 1) => {
  return useQuery<{ data: any[]; count: number }>({
    queryKey: ['orders', filters, page],
    queryFn: async () => {
      try {
        const params = { ...filters, page };
        const response = await get<PaginatedResponse<any>>('/api/spare-parts/orders/', { params });
        if (response.results !== undefined) {
           return { data: response.results, count: response.count };
        }
        const apiResponse = response as unknown as ApiResponse<any[]>;
        return {
          data: apiResponse.data || [],
          count: apiResponse.data?.length || 0
        };
      } catch (e: any) {
        // FALLBACK: If staff-scoped orders endpoint missing or 403
        if (e.message.includes('403') || e.message.includes('404')) {
          console.warn('Orders endpoint restricted or missing. Contact admin.');
        }
        throw e;
      }
    },
  });
};
