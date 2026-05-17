'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

export const usePaymentCollection = () => {
  const queryClient = useQueryClient();

  const collectPayment = useMutation({
    mutationFn: (data: { booking_id: number; amount: number }) => 
      post<ApiResponse<any>>('/api/staff/payments/collect/', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.booking_id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Payment collected successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to collect payment';
      toast.error(msg);
    },
  });

  return {
    collectPayment,
  };
};
