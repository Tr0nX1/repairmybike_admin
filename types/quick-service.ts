import { QuickServiceStatus } from './enums';
export type { QuickServiceStatus } from './enums';

export interface QuickServiceConfig {
  id: number;
  title: string;
  rules_html: string;
  base_price: string | number;
  support_phone: string;
}

export interface QuickServiceRequest {
  id: number;
  name: string;
  phone_number: string;
  vehicle_number?: string | null;
  vehicle_manufacturer?: string | null;
  vehicle_model?: string | null;
  status: QuickServiceStatus;
  staff_notes?: string | null;
  services_grabbed?: string | null;
  total_amount: string | number;
  guest_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuickServiceRequestUpdatePayload {
  vehicle_number?: string;
  vehicle_manufacturer?: string;
  vehicle_model?: string;
  status?: QuickServiceStatus;
  staff_notes?: string;
  services_grabbed?: string;
  total_amount?: string | number;
}

export interface QuickServiceFilters {
  status?: QuickServiceStatus | 'all';
  search?: string;
}
