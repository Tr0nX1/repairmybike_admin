'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { Booking } from '@/types/booking';
import { toast } from 'sonner';

export const useBookingDetail = (id?: number) => {
  const queryClient = useQueryClient();

  const query = useQuery<Booking>({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const response = await get<ApiResponse<Booking>>(`/api/staff/bookings/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: (status: string) => 
      patch(`/api/staff/bookings/${id}/update-status/`, { status }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Depending on whether backend returns standard envelope or flat
      const actualData = data.data || data;
      toast.success(data.message || `Status updated to ${actualData.booking_status}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  const assignMechanic = useMutation({
    mutationFn: (mechanicId: number) =>
      patch(`/api/bookings/bookings/${id}/assign-mechanic/`, { mechanic_id: mechanicId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      toast.success('Mechanic assigned');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign mechanic');
    }
  });

  const addPart = useMutation({
    mutationFn: (data: { part_id: number, quantity: number }) => 
      post(`/api/staff/bookings/${id}/add-part/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      toast.success('Part added to booking');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add part');
    }
  });

  const removePart = useMutation({
    mutationFn: (booking_part_id: number) => 
      post(`/api/staff/bookings/${id}/remove-part/`, { booking_part_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      toast.success('Part removed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove part');
    }
  });

  const updateBooking = useMutation({
    mutationFn: (data: Partial<Booking>) => 
      patch(`/api/staff/bookings/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      toast.success('Booking updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update booking');
    }
  });

  return {
    ...query,
    updateStatus,
    assignMechanic,
    addPart,
    removePart,
    updateBooking
  };
};
