'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

export interface VehicleType {
  id: number;
  name: string;
  image?: string;
}

export interface VehicleBrand {
  id: number;
  name: string;
  vehicle_type: number;
  image?: string;
}

export interface VehicleModel {
  id: number;
  name: string;
  vehicle_brand: number;
  year_from?: number;
  year_to?: number;
  engine_cc?: number;
  image?: string;
}

export const useVehicles = () => {
  const queryClient = useQueryClient();

  const useTypes = () => useQuery<VehicleType[]>({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const res = await get<any>('/api/vehicles/types/');
      return res.results ?? res.data ?? res ?? [];
    },
  });

  const useBrands = (typeId?: number) => useQuery<VehicleBrand[]>({
    queryKey: ['vehicle-brands', typeId],
    queryFn: async () => {
      const res = await get<any>('/api/vehicles/brands/', {
        params: typeId ? { vehicle_type: typeId } : {},
      });
      return res.results ?? res.data ?? res ?? [];
    },
    enabled: !!typeId,
  });

  const useModels = (brandId?: number) => useQuery<VehicleModel[]>({
    queryKey: ['vehicle-models', brandId],
    queryFn: async () => {
      const res = await get<any>('/api/vehicles/models/', {
        params: brandId ? { vehicle_brand: brandId } : {},
      });
      return res.results ?? res.data ?? res ?? [];
    },
    enabled: !!brandId,
  });

  const useAllModels = () => useQuery<VehicleModel[]>({
    queryKey: ['vehicle-models-all'],
    queryFn: async () => {
      const res = await get<any>('/api/vehicles/models/');
      return res.results ?? res.data ?? res ?? [];
    },
  });

  // Mutations
  const createType = useMutation({
    mutationFn: (data: Partial<VehicleType>) => post('/api/vehicles/types/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-types'] });
      toast.success('Vehicle type created');
    }
  });

  const createBrand = useMutation({
    mutationFn: (data: Partial<VehicleBrand>) => post('/api/vehicles/brands/', data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-brands', vars.vehicle_type] });
      toast.success('Brand added');
    }
  });

  const createModel = useMutation({
    mutationFn: (data: Partial<VehicleModel>) => post('/api/vehicles/models/', data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models', vars.vehicle_brand] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-models-all'] });
      toast.success('Model added');
    }
  });

  const updateModel = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<VehicleModel> }) => patch(`/api/vehicles/models/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-models-all'] });
      toast.success('Model updated');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update model';
      toast.error(msg);
    }
  });

  const deleteModel = useMutation({
    mutationFn: (id: number) => del(`/api/vehicles/models/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-models-all'] });
      toast.success('Model deleted');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete model';
      toast.error(msg);
    }
  });

  return {
    useTypes,
    useBrands,
    useModels,
    useAllModels,
    createType,
    createBrand,
    createModel,
    updateModel,
    deleteModel,
  };
};
