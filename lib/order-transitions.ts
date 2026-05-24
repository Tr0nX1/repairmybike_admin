import { ORDER_STATUS, type OrderStatus } from '@/types/enums';

export const VALID_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [ORDER_STATUS.CREATED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.FULFILLED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.FULFILLED]: [],
  [ORDER_STATUS.CANCELLED]: [],
} as const;

export function getValidNextOrderStatuses(status?: OrderStatus | null): readonly OrderStatus[] {
  if (!status) return [];
  return VALID_ORDER_STATUS_TRANSITIONS[status] ?? [];
}

export function isTerminalOrderStatus(status?: OrderStatus | null): boolean {
  return status === ORDER_STATUS.FULFILLED || status === ORDER_STATUS.CANCELLED;
}
