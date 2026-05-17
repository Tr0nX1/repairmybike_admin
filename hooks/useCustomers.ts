import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';

export interface CustomerListItem {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  total_ltv: string;
  loyalty_points: number;
  total_bookings: number;
  active_subscriptions: number;
  last_visit: string | null;
  created_at: string;
}

export interface CustomerDetail extends CustomerListItem {
  profile_picture_url: string | null;
  total_spent: string;
  booking_count: number;
  vehicles: any[];
  addresses: any[];
  recent_bookings: any[];
  referral_code: string;
  username: string;
}

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const params = search ? { search } : {};
      const res = await get<any>('/api/auth/customers/', { params });
      // The interceptor returns response.data directly. 
      // ViewSet list action usually returns an array or paginated object.
      return (res.results || res.data || res) as CustomerListItem[];
    },
  });
}

export function useCustomerDetail(id: number | null) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await get<any>(`/api/auth/customers/${id}/`);
      return (res.data || res) as CustomerDetail;
    },
    enabled: !!id,
  });
}
