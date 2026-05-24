'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';

export const useReports = (params: { range: string }) => {
  return useQuery<any>({
    queryKey: ['reports', params.range],
    queryFn: async () => {
      try {
        const response = await get<any>('/api/staff/reports/', { params });
        return response;
      } catch (err) {
        console.warn("Reports API not implemented yet, using fallback", err);
        return null;
      }
    },
  });
};
