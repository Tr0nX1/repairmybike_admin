import { BOOKING_STATUS, type BookingStatus } from '@/types/enums';

export const VALID_BOOKING_STATUS_TRANSITIONS: Partial<Record<BookingStatus, readonly BookingStatus[]>> = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.IN_PROGRESS]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
} as const;

export function getValidNextBookingStatuses(status?: BookingStatus | null): readonly BookingStatus[] {
  if (!status) return [];
  return VALID_BOOKING_STATUS_TRANSITIONS[status] ?? [];
}

export function isTerminalBookingStatus(status?: BookingStatus | null): boolean {
  return status === BOOKING_STATUS.COMPLETED || status === BOOKING_STATUS.CANCELLED;
}
