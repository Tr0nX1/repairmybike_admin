'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { ApiResponse, BookingStats } from '@/types/api';

export const useBookingStats = () => {
  return useQuery<BookingStats>({
    queryKey: ['bookings', 'stats'],
    queryFn: async () => {
      const response = await get<ApiResponse<BookingStats>>('/api/staff/bookings/stats/');
      return response.data;
    },
    refetchInterval: 30_000,
  });
};
