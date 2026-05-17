'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types/booking';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { get } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { Loader2, MapPin, Calendar, Check } from 'lucide-react';

interface AssignMechanicModalProps {
  bookingId: number | null;
  booking?: Booking;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Mechanic {
  id: number;
  name: string;
  phone?: string | null;
  is_manager: boolean;
  photo_url?: string | null;
}

export const AssignMechanicModal = ({ bookingId, booking, open, onClose, onSuccess }: AssignMechanicModalProps) => {
  const { assignMechanic } = useBookingDetail(bookingId || undefined);
  const [selectedMechanic, setSelectedMechanic] = useState<number | null>(booking?.mechanic_id || null);

  useEffect(() => {
    if (open) {
      setSelectedMechanic(booking?.mechanic_id || null);
    }
  }, [booking?.mechanic_id, open]);

  const { data: mechanics = [], isLoading, isError, refetch } = useQuery<Mechanic[]>({
    queryKey: ['staff-mechanics'],
    queryFn: async () => {
      const response = await get<ApiResponse<Mechanic[]>>('/api/staff/staff/');
      return response.data;
    },
    enabled: open,
  });

  const handleConfirm = async () => {
    if (!bookingId || !selectedMechanic) return;

    try {
      await assignMechanic.mutateAsync(selectedMechanic);
      onSuccess?.();
      onClose();
    } catch {
      // Error toast is handled by the mutation.
    }
  };

  if (!bookingId || !booking) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <DialogTitle className="text-lg font-bold">Assign Mechanic - Booking #{booking.id}</DialogTitle>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{booking.vehicle_model_name}</span>
              <span>-</span>
              <span>{booking.customer.name}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider">
              <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {booking.appointment_date}</div>
              <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {booking.service_location || 'Service'}</div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
            {isLoading && (
              <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading mechanics
              </div>
            )}
            {isError && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <p className="text-xs text-muted-foreground">Could not load mechanics.</p>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => refetch()}>Retry</Button>
              </div>
            )}
            {!isLoading && !isError && mechanics.length === 0 && (
              <div className="py-10 text-center text-xs text-muted-foreground">No active staff users found.</div>
            )}
            {mechanics.map((mechanic) => {
              const isSelected = selectedMechanic === mechanic.id;
              return (
                <div
                  key={mechanic.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all',
                    isSelected
                      ? 'bg-[#E6F1FB] border-[#378ADD] shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-transparent'
                  )}
                  onClick={() => setSelectedMechanic(mechanic.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 overflow-hidden">
                      {mechanic.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mechanic.photo_url} alt={mechanic.name} className="h-full w-full object-cover" />
                      ) : (
                        mechanic.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{mechanic.name}</span>
                      <span className="text-[10px] text-muted-foreground">{mechanic.phone || 'No phone on file'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[9px] font-bold uppercase',
                        mechanic.is_manager ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      )}
                    >
                      {mechanic.is_manager ? 'Manager' : 'Staff'}
                    </Badge>
                    {isSelected && <Check className="h-4 w-4 text-[#378ADD]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 mt-0">
          <Button variant="ghost" className="text-xs h-9" onClick={onClose}>Cancel</Button>
          <Button
            className="h-9 text-xs bg-[#378ADD] hover:bg-[#2D6FA3] text-white"
            onClick={handleConfirm}
            disabled={!selectedMechanic || assignMechanic.isPending}
          >
            {assignMechanic.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
