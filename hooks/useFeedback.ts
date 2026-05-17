import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch, del } from '@/lib/api-client';
import { toast } from 'sonner';

export interface Feedback {
  id: number;
  customer_name: string;
  booking_id_display: number;
  rating: number;
  comment: string;
  category: 'service' | 'app' | 'complaint' | 'suggestion';
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export function useFeedback() {
  const queryClient = useQueryClient();

  const query = useQuery<Feedback[]>({
    queryKey: ['feedback'],
    queryFn: async () => {
      const res = await get<any>('/api/feedback/');
      return (res.results || res.data || res) as Feedback[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      patch(`/api/feedback/${id}/`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback status updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update status')
  });

  const deleteFeedback = useMutation({
    mutationFn: (id: number) => del(`/api/feedback/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete feedback')
  });

  return { ...query, updateStatus, deleteFeedback };
}
