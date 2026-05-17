'use client';

import { useMutation } from '@tanstack/react-query';
import { post } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

interface UploadOptions {
  endpoint: string;
  fieldName?: string;
  extraData?: Record<string, any>;
}

export const useImageUpload = (options: UploadOptions) => {
  const { endpoint, fieldName = 'image', extraData = {} } = options;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append(fieldName, file);
      
      // Append extra data if any
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await post<ApiResponse<{ image_url: string; url?: string; photo_url?: string; profile_picture_url?: string }>>(
        endpoint, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Handle various response keys from different backend actions
      return (
        response.data.image_url || 
        response.data.url || 
        response.data.photo_url || 
        response.data.profile_picture_url || 
        ''
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Image upload failed';
      toast.error(msg);
    },
  });

  return {
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
    uploadedUrl: uploadMutation.data,
  };
};
