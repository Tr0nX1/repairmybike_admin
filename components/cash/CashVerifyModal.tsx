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
import { Checkbox } from '@/components/ui/checkbox';
import { useCashReconciliation } from '@/hooks/useCashReconciliation';
import { Booking } from '@/types/booking';
import { useState, useMemo } from 'react';
import { Banknote, Loader2, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CashVerifyModalProps {
  mechanicName: string;
  bookings: Booking[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CashVerifyModal = ({ mechanicName, bookings, open, onOpenChange }: CashVerifyModalProps) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(bookings.map(b => b.id));
  const { verifyCash } = useCashReconciliation();

  const totalAmount = useMemo(() => {
    return bookings
      .filter(b => selectedIds.includes(b.id))
      .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);
  }, [bookings, selectedIds]);

  const toggleBooking = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleVerify = () => {
    verifyCash.mutate({
      booking_ids: selectedIds,
      total_collected: totalAmount
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-slate-50 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-100 text-amber-700">
              <Banknote className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Cash Verification</DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium">
            Perform digital handshake with <span className="text-[#378ADD] font-bold">{mechanicName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {bookings.map(booking => (
              <div 
                key={booking.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => toggleBooking(booking.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedIds.includes(booking.id)} 
                    onCheckedChange={() => toggleBooking(booking.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">#{booking.id} - {booking.customer.name}</span>
                    <span className="text-[10px] text-muted-foreground">{booking.vehicle_model_name}</span>
                  </div>
                </div>
                <span className="text-xs font-bold">₹{parseFloat(booking.total_amount).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Total to Collect</span>
              <span className="text-xl font-bold text-blue-900">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 items-start">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
              By clicking verify, you confirm that you have physically received <span className="font-bold">₹{totalAmount.toLocaleString()}</span> in cash from the mechanic.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 border-t bg-slate-50 mt-0">
          <Button variant="ghost" className="text-xs h-9" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="h-9 text-xs bg-[#378ADD] hover:bg-[#2D6FA3] text-white" 
            onClick={handleVerify}
            disabled={selectedIds.length === 0 || verifyCash.isPending}
          >
            {verifyCash.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Banknote className="h-4 w-4 mr-2" />}
            Confirm Physical Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
