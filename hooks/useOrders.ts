'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Order } from '@/types/parts';
import type { OrderPaymentStatus, OrderStatus } from '@/types/enums';

type OrderFilters = {
  status?: OrderStatus;
  payment_status?: OrderPaymentStatus;
  phone?: string;
  search?: string;
};

export const useOrders = (filters: OrderFilters = {}, page: number = 1, enabled = true) => {
  return useQuery<{ data: Order[]; count: number }>({
    queryKey: ['orders', filters, page],
    enabled,
    queryFn: async () => {
      try {
        const params = { ...filters, page };
        const response = await get<PaginatedResponse<Order>>('/api/spare-parts/orders/', { params });
        if (response.results !== undefined) {
           return { data: response.results, count: response.count };
        }
        const apiResponse = response as unknown as ApiResponse<Order[]>;
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
