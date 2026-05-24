'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

export interface ShopInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  opening_time?: string | null;
  closing_time?: string | null;
  working_days: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const normalizeShopInfo = (response: ApiResponse<ShopInfo[]> | ApiResponse<ShopInfo> | ShopInfo[] | ShopInfo | undefined): ShopInfo | null => {
  if (!response) {
    return null;
  }

  if (Array.isArray(response)) {
    return response[0] ?? null;
  }

  if ('data' in response) {
    const data = response.data;

    if (Array.isArray(data)) {
      return data[0] ?? null;
    }

    return data ?? null;
  }

  return response;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to update shop information';
};

export const useShopInfo = () => {
  const queryClient = useQueryClient();

  const shopInfoQuery = useQuery<ShopInfo | null>({
    queryKey: ['shop-info'],
    queryFn: async () => {
      const response = await get<ApiResponse<ShopInfo[]>>('/api/shop/shop-info/');
      return normalizeShopInfo(response);
    },
  });

  const updateShopInfo = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ShopInfo> }) => {
      const response = await patch<ApiResponse<ShopInfo>>(`/api/shop/shop-info/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-info'] });
      toast.success('Shop information updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return {
    shopInfo: shopInfoQuery.data ?? null,
    isLoading: shopInfoQuery.isLoading,
    isError: shopInfoQuery.isError,
    updateShopInfo,
  };
};
