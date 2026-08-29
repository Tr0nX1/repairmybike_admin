'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { del, get, patch, post } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { Booking, BookingPart } from '@/types/booking';
import type { BookingStatus } from '@/types/enums';
import { toast } from 'sonner';

type ApiErrorWithCode = Error & {
  code?: string;
  status?: number;
  details?: unknown;
};

type UpdateBookingStatusPayload = {
  status: BookingStatus;
  notes?: string;
};

type AddBookingPartPayload = {
  spare_part_id: number;
  quantity: number;
};

type AddBookingServicePayload = {
  service_id: number;
  custom_price?: number;
};

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
    mutationFn: async ({ status, notes }: UpdateBookingStatusPayload) => {
      try {
        return await patch<ApiResponse<Booking>>(`/api/staff/bookings/${id}/update-status/`, {
          status,
          ...(notes?.trim() ? { notes: notes.trim() } : {}),
        });
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      const actualData = data.data || data;
      toast.success(data.message || `Status updated to ${actualData.booking_status}`);
    },
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
    mutationFn: async (data: AddBookingPartPayload) => {
      try {
        return await post<ApiResponse<Booking>>(`/api/staff/bookings/${id}/add-part/`, data);
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Part added to booking');
    }
  });

  const removePart = useMutation({
    mutationFn: async (bookingPartId: number) => {
      try {
        return await del<ApiResponse<Booking>>(`/api/staff/bookings/${id}/remove-part/${bookingPartId}/`);
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Part removed');
    }
  });

  const approvePart = useMutation({
    mutationFn: async (bookingPartId: number) => {
      try {
        return await post<ApiResponse<BookingPart>>(`/api/staff/bookings/${id}/approve-part/${bookingPartId}/`);
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Part approved');
    },
  });

  const rejectPart = useMutation({
    mutationFn: async (bookingPartId: number) => {
      try {
        return await post<ApiResponse<BookingPart>>(`/api/staff/bookings/${id}/reject-part/${bookingPartId}/`);
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Part rejected');
    },
  });

  const addService = useMutation({
    mutationFn: async (data: AddBookingServicePayload) => {
      try {
        return await post<ApiResponse<Booking>>(`/api/staff/bookings/${id}/add-service/`, data);
      } catch (error) {
        throw error as ApiErrorWithCode;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Service added to booking');
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
    addService,
    removePart,
    approvePart,
    rejectPart,
    updateBooking
  };
};
