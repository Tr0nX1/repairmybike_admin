'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { ApiResponse, BookingStats } from '@/types/api';

export const useBookingStats = () => {
  return useQuery<BookingStats>({
    queryKey: ['bookings', 'stats'],
    queryFn: async () => {
      const response = await get<any>('/api/staff/bookings/stats/');
      return response.data || response;
    },
    refetchInterval: 30_000,
  });
};
