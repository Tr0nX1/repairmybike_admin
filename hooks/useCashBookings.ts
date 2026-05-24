'use client';

import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import { Booking } from '@/types/booking';
import { BOOKING_PAYMENT_METHOD, BOOKING_PAYMENT_STATUS } from '@/types/enums';
import { useMemo } from 'react';

export const useCashBookings = () => {
  const pendingQuery = useQuery<{ data: Booking[]; count: number }>({
    queryKey: ['bookings', 'cash', 'pending'],
    queryFn: () => get<{ data: Booking[]; count: number }>('/api/staff/bookings/', { 
      params: {
        payment_method: BOOKING_PAYMENT_METHOD.CASH,
        payment_status: BOOKING_PAYMENT_STATUS.PENDING,
      } 
    }),
  });

  const completedQuery = useQuery<{ data: Booking[]; count: number }>({
    queryKey: ['bookings', 'cash', 'completed'],
    queryFn: () => get<{ data: Booking[]; count: number }>('/api/staff/bookings/', { 
      params: {
        payment_method: BOOKING_PAYMENT_METHOD.CASH,
        payment_status: BOOKING_PAYMENT_STATUS.COMPLETED,
      } 
    }),
  });

  const groupedByMechanic = useMemo(() => {
    const allBookings = [
      ...(pendingQuery.data?.data || []),
      ...(completedQuery.data?.data || [])
    ];

    return allBookings.reduce((acc, booking) => {
      const mechanicName = (booking as any).mechanic_name || 'Unassigned / Field Staff';
      if (!acc[mechanicName]) acc[mechanicName] = [];
      acc[mechanicName].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);
  }, [pendingQuery.data, completedQuery.data]);

  const summary = useMemo(() => {
    const pending = pendingQuery.data?.data || [];
    const completed = completedQuery.data?.data || [];

    return {
      totalDue: pending.reduce((sum, b) => sum + parseFloat(b.total_amount), 0),
      collected: completed.reduce((sum, b) => sum + parseFloat(b.total_amount), 0),
      unverifiedCount: pending.length
    };
  }, [pendingQuery.data, completedQuery.data]);

  return {
    pendingQuery,
    completedQuery,
    byMechanic: groupedByMechanic,
    summary
  };
};
