import type {
  BookingPartApprovalStatus,
  BookingPaymentMethod,
  BookingPaymentStatus,
  BookingStatus,
} from './enums';

export interface BookingService {
  id: number;
  service: string;
  service_name?: string;
  category_name?: string;
  price: string;
  created_at?: string;
}

export interface BookingPart {
  id: number;
  spare_part?: number;
  part_name: string;
  sku?: string;
  quantity: number;
  unit_price: string;
  total_price?: string;
  approval_status?: BookingPartApprovalStatus;
  approved_by?: number | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  price_locked_at?: string;
}

export interface Booking {
  id: number;
  customer: {
    id?: number;
    name: string;
    phone: string;
    email?: string | null;
  };
  mechanic?: number | null;
  mechanic_id?: number | null;
  mechanic_name?: string | null;
  vehicle_model?: number;
  vehicle_model_name: string;
  vehicle_brand_name?: string;
  vehicle_type_name?: string;
  booking_status: BookingStatus;
  payment_status: BookingPaymentStatus;
  payment_method: BookingPaymentMethod;
  total_amount: string;
  service_location?: 'home' | 'shop';
  address?: string | null;
  appointment_date: string;
  appointment_time: string;
  booking_services: BookingService[];
  booking_parts: BookingPart[];
  notes?: string;
  customer_notes?: string | null;
  internal_notes?: string | null;
  staff_notes?: string | null;
  discount_amount?: string;
  odometer_reading?: number | null;
  subscription_id?: number | null;
  subscription_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  payment_status?: BookingPaymentStatus;
  date_from?: string;
  date_to?: string;
}

export interface AssignMechanicPayload {
  booking_id: number;
  mechanic_id: number;
}
