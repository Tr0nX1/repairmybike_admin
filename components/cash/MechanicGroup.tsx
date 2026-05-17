'use client';

import { useState } from 'react';
import { Booking } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { ChevronRight, Banknote, User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CashVerifyModal } from './CashVerifyModal';

interface MechanicGroupProps {
  mechanicName: string;
  bookings: Booking[];
}

export const MechanicGroup = ({ mechanicName, bookings }: MechanicGroupProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const totalAmount = bookings.reduce((sum, b) => sum + parseFloat(b.total_amount), 0);

  return (
    <div className="rounded-xl bg-white shadow-sm border overflow-hidden">
      {/* Mechanic Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50/50 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#378ADD] text-sm font-bold text-white shadow-sm">
            {mechanicName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-foreground">{mechanicName}</h3>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {bookings.length} jobs pending verification
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Collected Cash</span>
            <span className="text-lg font-bold text-foreground">₹{totalAmount.toLocaleString()}</span>
          </div>
          <Button 
            size="sm" 
            className="h-9 bg-[#378ADD] hover:bg-[#2D6FA3] text-white gap-2 px-4 shadow-sm"
            onClick={() => setModalOpen(true)}
          >
            <Banknote className="h-4 w-4" />
            Verify Receipt
          </Button>
        </div>
      </div>

      {/* Booking List */}
      <div className="divide-y">
        {bookings.map((booking) => (
          <div key={booking.id} className="group flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-[#378ADD] w-[50px]">#{booking.id}</div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">{booking.customer.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{booking.vehicle_model_name}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-foreground">₹{parseFloat(booking.total_amount).toLocaleString()}</span>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <CashVerifyModal 
        mechanicName={mechanicName} 
        bookings={bookings} 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
    </div>
  );
};
