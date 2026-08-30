'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/api-client';
import { PaginatedResponse, ApiResponse } from '@/types/api';
import { 
  QuickServiceRequest, 
  QuickServiceRequestUpdatePayload, 
  QuickServiceFilters 
} from '@/types/quick-service';
import { toast } from 'sonner';

export const useQuickServiceRequests = (filters: QuickServiceFilters = {}, page: number = 1) => {
  return useQuery<{ data: QuickServiceRequest[]; count: number }>({
    queryKey: ['quick-service-requests', filters, page],
    queryFn: async () => {
      const params: Record<string, any> = { page };
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      try {
        const response = await get<any>('/api/quick-service/requests/', { params });

        // Handle Django DRF Paginated Response
        if (response && response.results !== undefined) {
          return { data: response.results, count: response.count || response.results.length };
        }

        // Handle standard array response
        if (Array.isArray(response)) {
          return { data: response, count: response.length };
        }

        // Handle ApiResponse wrapped object
        if (response && Array.isArray(response.data)) {
          return { data: response.data, count: response.count || response.data.length };
        }

        return { data: [], count: 0 };
      } catch (err) {
        console.error('Error fetching Quick Service requests:', err);
        return { data: [], count: 0 };
      }
    },
    refetchInterval: 30_000, // Refresh every 30s
  });
};

export const useQuickServiceRequestUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: QuickServiceRequestUpdatePayload }) => {
      return patch<QuickServiceRequest>(`/api/quick-service/requests/${id}/`, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quick-service-requests'] });
      toast.success(`Quick Service #${variables.id} updated successfully`);
    },
    onError: (err: any) => {
      const msg = err.message || err.response?.data?.message || 'Failed to update Quick Service request';
      toast.error(msg);
    },
  });
};
