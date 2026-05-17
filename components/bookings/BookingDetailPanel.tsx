'use client';

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { useBookingDetail } from '@/hooks/useBookingDetail';
import { usePaymentCollection } from '@/hooks/usePaymentCollection';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Loader2, User, Phone, MapPin, Calendar, Clock, Trash2, Plus, Banknote, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface BookingDetailPanelProps {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookingDetailPanel = ({ id, open, onOpenChange }: BookingDetailPanelProps) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState('');
  
  const { 
    data: booking, 
    isLoading, 
    updateStatus, 
    removePart 
  } = useBookingDetail(id || undefined);

  const { collectPayment } = usePaymentCollection();

  useEffect(() => {
    if (booking) {
      setCollectionAmount(booking.total_amount);
    }
  }, [booking]);

  if (!id) return null;

  const statuses = ['pending', 'confirmed', 'en_route', 'arrived', 'started', 'completed', 'cancelled'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 flex flex-col">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : booking ? (
          <>
            <SheetHeader className="p-6 pb-0">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] font-bold text-[#378ADD]">#{booking.id}</Badge>
                <StatusBadge status={booking.booking_status} />
              </div>
              <SheetTitle className="text-lg font-bold">Booking Details</SheetTitle>
              <SheetDescription className="text-xs">
                Manage service status, parts, and assignments
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 p-6 space-y-6">
              {/* Customer Info */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer & Vehicle</h4>
                <div className="grid gap-3 rounded-lg border p-3 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{booking.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Vehicle: {booking.vehicle_model_name}</span>
                  </div>
                </div>
              </section>

              {/* Status Update */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Update Status</h4>
                <Select 
                  defaultValue={booking.booking_status} 
                  onValueChange={(val: string | null) => val && updateStatus.mutate(val)}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              {/* Services & Parts */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Service Items</h4>
                <div className="space-y-2">
                  {booking.booking_services.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-dashed text-xs">
                      <span className="font-medium">{s.service}</span>
                      <span className="font-bold">₹{parseFloat(s.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase">Spare Parts</h5>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-[#378ADD]">
                      <Plus className="h-3 w-3" /> Add Part
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {booking.booking_parts.length === 0 ? (
                      <div className="text-[10px] text-center py-4 text-muted-foreground bg-slate-50 rounded-md border border-dashed">
                        No parts added yet
                      </div>
                    ) : (
                      booking.booking_parts.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 rounded-md border text-xs bg-white group">
                          <div className="flex flex-col">
                            <span className="font-medium">{p.part_name}</span>
                            <span className="text-[10px] text-muted-foreground">Qty: {p.quantity} × ₹{parseFloat(p.unit_price).toLocaleString()}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePart.mutate(p.id)}
                            disabled={removePart.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <Separator />

              {/* Totals */}
              <section className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase font-bold tracking-tighter">Payment Details</span>
                  <StatusBadge status={booking.payment_status} type="payment" />
                </div>
                
                <div className="rounded-lg border p-3 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-bold uppercase">{booking.payment_method}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Total Amount</span>
                    <span className="text-sm font-black text-[#378ADD]">₹{parseFloat(booking.total_amount).toLocaleString()}</span>
                  </div>
                </div>

                {booking.payment_method === 'cash' && booking.payment_status !== 'completed' && (
                  <div className="pt-2">
                    {!isCollecting ? (
                      <Button 
                        className="w-full bg-[#10B981] hover:bg-[#059669] text-white h-10 font-bold uppercase text-[11px] tracking-widest gap-2"
                        onClick={() => setIsCollecting(true)}
                      >
                        <Banknote className="h-4 w-4" />
                        Collect Cash Payment
                      </Button>
                    ) : (
                      <div className="space-y-3 p-4 rounded-xl border-2 border-[#10B981] bg-white animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-slate-500">Amount to collect</span>
                           <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-bold" onClick={() => setIsCollecting(false)}>Cancel</Button>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                          <Input 
                            type="number" 
                            className="pl-7 h-10 font-black text-lg text-[#10B981]" 
                            value={collectionAmount}
                            onChange={(e) => setCollectionAmount(e.target.value)}
                          />
                        </div>
                        <Button 
                          className="w-full bg-[#10B981] hover:bg-[#059669] text-white h-10 font-bold uppercase text-[11px] tracking-widest gap-2"
                          disabled={collectPayment.isPending}
                          onClick={async () => {
                            try {
                              await collectPayment.mutateAsync({
                                booking_id: booking.id,
                                amount: parseFloat(collectionAmount)
                              });
                              setIsCollecting(false);
                            } catch (e) {}
                          }}
                        >
                          {collectPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Confirm Receipt
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Booking not found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
