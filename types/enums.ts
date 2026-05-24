export const BOOKING_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  STARTED: 'started',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const BOOKING_PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;

export type BookingPaymentStatus =
  typeof BOOKING_PAYMENT_STATUS[keyof typeof BOOKING_PAYMENT_STATUS];

export const BOOKING_PAYMENT_METHOD = {
  CASH: 'cash',
  RAZORPAY: 'razorpay',
} as const;

export type BookingPaymentMethod =
  typeof BOOKING_PAYMENT_METHOD[keyof typeof BOOKING_PAYMENT_METHOD];

export const ORDER_STATUS = {
  CREATED: 'created',
  CONFIRMED: 'confirmed',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_PAYMENT_STATUS = {
  CASH_DUE: 'cash_due',
  CASH_PAID: 'cash_paid',
} as const;

export type OrderPaymentStatus =
  typeof ORDER_PAYMENT_STATUS[keyof typeof ORDER_PAYMENT_STATUS];

export const BOOKING_PART_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type BookingPartApprovalStatus =
  typeof BOOKING_PART_APPROVAL_STATUS[keyof typeof BOOKING_PART_APPROVAL_STATUS];

export const SUBSCRIPTION_STATUS = [
  'pending',
  'active',
  'canceled',
  'expired',
] as const;
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[number];
