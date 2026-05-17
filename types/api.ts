export interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BookingStats {
  total_bookings: number;
  booking_status: Record<string, number>;
  payment_status: Record<string, number>;
}

export interface ActivityLog {
  id: number;
  username: string;
  full_name: string;
  action_type: string;
  description: string;
  timestamp: string;
}
