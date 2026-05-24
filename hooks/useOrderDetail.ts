'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { Order } from '@/types/parts';
import type { OrderStatus } from '@/types/enums';
import { toast } from 'sonner';

type ApiErrorWithCode = Error & {
  code?: string;
  status?: number;
  details?: unknown;
};

type OrderStatusPayload = {
  status: OrderStatus;
  notes?: string;
};

type OrderCashPaymentPayload = {
  amount_received: string | number;
  notes?: string;
};

export const useOrderDetail = (id?: number) => {
  const queryClient = useQueryClient();

  const query = useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: async () => {
      const response = await get<ApiResponse<Order>>(`/api/spare-parts/orders/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  const transitionStatus = useMutation({
    mutationFn: async ({ status, notes }: OrderStatusPayload) => {
      try {
        return await post<ApiResponse<Order>>(`/api/spare-parts/orders/${id}/transition-status/`, {
          status,
          ...(notes?.trim() ? { notes: notes.trim() } : {}),
        });
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      toast.success(response.message || 'Order status updated');
    },
  });

  const markCashPaid = useMutation({
    mutationFn: async ({ amount_received, notes }: OrderCashPaymentPayload) => {
      try {
        return await post<ApiResponse<Order>>(`/api/spare-parts/orders/${id}/mark-cash-paid/`, {
          amount_received,
          ...(notes?.trim() ? { notes: notes.trim() } : {}),
        });
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      toast.success(response.message || 'Order marked cash paid');
    },
  });

  return {
    ...query,
    transitionStatus,
    markCashPaid,
  };
};
