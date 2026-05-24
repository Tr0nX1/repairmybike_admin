'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';

export interface PaymentRecord {
  id: number;
  booking: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount: string;
  currency: string;
  status: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export const usePayments = () => {
  return useQuery<PaymentRecord[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await get<PaymentRecord[]>('/api/payments/payments/');
      return response || [];
    },
  });
};
