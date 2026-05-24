'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { Booking } from '@/types/booking';
import type { BookingPaymentMethod, BookingPaymentStatus, BookingStatus } from '@/types/enums';
import { toast } from 'sonner';

interface BookingFilters {
  status?: BookingStatus;
  date?: string;
  search?: string;
  limit?: number;
  ordering?: string;
  payment_method?: BookingPaymentMethod;
  payment_status?: BookingPaymentStatus;
  mechanic_id?: number | string;
}

export const useBookings = (filters: BookingFilters = {}, page: number = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery<{ data: Booking[]; count: number }>({
    queryKey: ['bookings', filters, page],
    queryFn: async () => {
      const params = { ...filters, page };
      try {
        const response = await get<PaginatedResponse<Booking>>('/api/staff/bookings/', { params });
        if (response.results !== undefined) {
           return { data: response.results, count: response.count };
        }
        // Fallback
        const apiResponse = response as unknown as ApiResponse<Booking[]>;
        return { data: apiResponse.data || [], count: apiResponse.data?.length || 0 };
      } catch (err) {
         console.error("Error fetching bookings", err);
         return { data: [], count: 0 };
      }
    },
    refetchInterval: 60_000,
  });

  const createQuickService = useMutation({
    mutationFn: (data: any) => post<ApiResponse<Booking>>('/api/bookings/quick-service/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Walk-in booking created successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create booking';
      toast.error(msg);
    }
  });

  return {
    ...query,
    createQuickService
  };
};
