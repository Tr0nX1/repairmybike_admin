'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { Loader2, AlertCircle } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface UpdateStatusModalProps {
  bookingId: number | null;
  currentStatus?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UpdateStatusModal = ({ bookingId, currentStatus, open, onClose, onSuccess }: UpdateStatusModalProps) => {
  const { updateStatus } = useBookingDetail(bookingId || undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus || '');
  const [notes, setNotes] = useState('');

  const statusLifecycle: Record<string, string[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['en_route', 'cancelled'],
    'en_route': ['arrived'],
    'arrived': ['started'],
    'started': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };

  const allowedStatuses = currentStatus ? statusLifecycle[currentStatus] || [] : [];

  const handleUpdate = async () => {
    if (!bookingId || !selectedStatus) return;

    try {
      await updateStatus.mutateAsync(selectedStatus);
      onSuccess?.();
      onClose();
    } catch (e) {
      // Error handled by mutation toast
    }
  };

  if (!bookingId) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <DialogTitle className="text-lg font-bold">Update Status — #{bookingId}</DialogTitle>
          <DialogDescription className="text-xs">
            Current status: <span className="font-bold uppercase text-[#378ADD]">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Next Status</label>
            {allowedStatuses.length > 0 ? (
              <Select defaultValue={selectedStatus} onValueChange={(val: string | null) => setSelectedStatus(val || '')}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-md bg-slate-50 border text-xs text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                No further status transitions allowed.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status Notes (Optional)</label>
            <Textarea 
              placeholder="E.g. Customer not available, part delayed..." 
              className="text-xs resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 mt-0">
          <Button variant="ghost" className="text-xs h-9" onClick={onClose}>Cancel</Button>
          <Button 
            className="h-9 text-xs bg-[#378ADD] hover:bg-[#2D6FA3] text-white"
            onClick={handleUpdate}
            disabled={!selectedStatus || selectedStatus === currentStatus || updateStatus.isPending || allowedStatuses.length === 0}
          >
            {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
