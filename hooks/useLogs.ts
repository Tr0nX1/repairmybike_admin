'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { PaginatedResponse, ActivityLog } from '@/types/api';

export const useLogs = (filters: any = {}, page: number = 1) => {
  return useQuery<PaginatedResponse<ActivityLog>>({
    queryKey: ['logs', filters, page],
    queryFn: async () => {
      const params = { ...filters, page };
      // Backend paginated endpoints return { count, next, previous, results }
      const response = await get<PaginatedResponse<ActivityLog>>('/api/staff/logs/', { params });
      return response;
    },
    refetchInterval: 60_000,
  });
};
