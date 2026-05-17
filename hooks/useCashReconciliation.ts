'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/lib/api-client';
import { toast } from 'sonner';

export const useCashReconciliation = () => {
  const queryClient = useQueryClient();

  const verifyCash = useMutation({
    mutationFn: (data: { booking_ids: number[], total_collected: number }) => 
      post('/api/staff/reconcile-cash/', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'stats'] });
      toast.success(data.message || 'Cash verified and remitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify cash');
    }
  });

  return {
    verifyCash
  };
};
