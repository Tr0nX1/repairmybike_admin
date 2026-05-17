import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api-client';
import { toast } from 'sonner';

export interface CashSession {
  id: number;
  staff_name: string;
  staff_id: number;
  date: string;
  opening_balance: string;
  closing_balance: string | null;
  expected_closing: string | null;
  variance: string | null;
  status: 'open' | 'pending_approval' | 'approved' | 'flagged';
  notes: string;
  approval_notes: string;
  approved_by_name: string | null;
  approved_at: string | null;
}

export interface CashMovement {
  id: number;
  movement_type: string;
  amount: string;
  description: string;
  booking_id: number | null;
  recorded_by_name: string;
  recorded_at: string;
  verification_status: string;
}

export function useCashSessions(filters: any = {}) {
  return useQuery({
    queryKey: ['cash-sessions', filters],
    queryFn: async () => {
      const res = await get<any>('/api/staff/cash-sessions/', { params: filters });
      return (res.results || res.data || res) as CashSession[];
    },
  });
}

export function useCashMovements(sessionId: number | null) {
  return useQuery({
    queryKey: ['cash-movements', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const res = await get<any>(`/api/staff/cash-sessions/${sessionId}/movements/`);
      return (res.data || res) as CashMovement[];
    },
    enabled: !!sessionId,
  });
}

export function useStaffList() {
  return useQuery({
    queryKey: ['staff-list'],
    queryFn: async () => {
      const res = await get<any>('/api/staff/staff/');
      return (res.data || res) as any[];
    },
  });
}

export function useApproveCashSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved, notes }: { id: number; approved: boolean; notes?: string }) =>
      post(`/api/staff/cash-sessions/${id}/approve/`, { approved, notes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
      toast.success(`Session ${variables.approved ? 'approved' : 'flagged'}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Action failed');
    },
  });
}
