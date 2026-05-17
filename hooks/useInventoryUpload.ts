'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

export interface BulkUploadResponse {
  created: number;
  updated: number;
}

export const useInventoryUpload = () => {
  const queryClient = useQueryClient();

  const bulkUpload = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use axios directly from api-client if post doesn't handle multipart correctly, 
      // but usually post(url, formData) works.
      return post<ApiResponse<BulkUploadResponse>>('/api/spare-parts/parts/bulk-upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      const { created, updated } = response.data;
      toast.success(`Success! Created: ${created}, Updated: ${updated}`);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || err.message || 'Failed to upload CSV';
      toast.error(message);
    },
  });

  return {
    bulkUpload,
  };
};
